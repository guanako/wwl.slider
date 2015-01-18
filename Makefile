#
# Copyright © 2013-2014 Max Ruman, Guanako
# 
# This file is part of Web Widget Library ("WWL").
# 
# WWL is free software: you can redistribute it and/or modify it under
# the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, either version 3 of the License, or (at
# your option) any later version.
# 
# WWL is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
# FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public
# License for more details.
# 
# You should have received a copy of the GNU Lesser General Public
# License along with WWL. If not, see <http://www.gnu.org/licenses/>.
#

#-----------------------------------------------------------------------
# Configuration
#-----------------------------------------------------------------------

widget = wwl.slider

widget_main = Slider.js
styles_main = styles.less

#-----------------------------------------------------------------------
# Build parameters
#-----------------------------------------------------------------------

env = debug

# Make execution silent and set the shell
.SILENT:
SHELL = /bin/bash

# Environment
ln         = ln -sr
node       = node
lessc_bin  = lessc
jspp_bin   = jspp
jspp_obj   = min
uglify_bin = uglifyjs

task_ok = ✔
task_err = ✘
task_wip = …

# Detect Windows
ifeq ($(OSTYPE), msys)
	ln = cp -r
	task_ok = OK
	task_err = Error
	task_wip = ...
endif
ifeq ($(OSTYPE), win32)
	ln = cp -r
	task_ok = OK
	task_err = Error
	task_wip = ...
endif

ifeq ($(env), release)
	lessc_flags  = -x -O2
	uglify_flags = --compress --mangle
else
	lessc_flags  =
	uglify_flags = --beautify --lint -v
endif


# Widget files
widget_out      = dist/$(widget).js
widget_src_main = src/$(widget_main)
widget_src_all  = $(shell find src -type f -name "*.js")
widget_src      = $(shell $(jspp_bin) dep $(widget_src_main)) $(realpath $(widget_src_main))
widget_obj      = $(addsuffix .$(jspp_obj), $(widget_src))
widget_obj_all  = $(shell find src -type f -name "*.js.$(jspp_obj)")

# Optional styles files
styles_out      = dist/$(widget).css
styles_src      = $(shell find res/styles -type f -name "*.less")
styles_src_main = res/styles/$(styles_main)

#
# Call a build unit
#
# @param string  The name of the build
# @param command The command to execute
# @param command The command to execute in case of failure
#
define task
	op="$$(echo $1 | sed -e 's/^ *//' -e 's/ *$$//')";                   \
	echo -n "$(task_wip) $$op";                                        \
		r=$$(( $2 ) 3>&1 1>&2 2>&3)                                        \
			&& echo -e "\r\e[1;32m$(task_ok)\e[0m $(stdout_prefix)$$op"    \
			|| ($3;                                                          \
				echo -e "\r\e[1;31m$(task_err)\e[0m $(stdout_prefix)$$op\n"; \
				echo "$$r" | sed "s:^:\x1b[0;31m  >\x1b[0m :g";                \
				echo;                                                          \
				exit 1                                                         \
			)
endef

#
# Generate the version file
#
ver_file = Version
ver = $(shell                                                  \
	test -d .git || (echo "null"; exit 1) || exit 2>/dev/null;   \
	git describe --always | perl -pe "s/^v//" | (                \
		[[ "$(env)" == "debug" ]]                                  \
			&& perl -pe "s/^(\d+\.\d+\.\d+)$$|(-\d+-)/\$$1-dev\$$2/" \
			|| cat                                                   \
	)                                                            \
)

#-----------------------------------------------------------------------
# Commands
#-----------------------------------------------------------------------

default: widget styles $(ver_file)

clean:
	if [[ -n "$(ls dist/*)" || -n "$(widget_obj_all)" ]]; then \
		$(call task, "Cleaning compiled objects",                \
			rm -rf dist/*;                                         \
			rm -f $(widget_obj_all);                               \
			rm -f $(ver_file),                                     \
		true);                                                   \
	fi

.PHONY: default clean

#-----------------------------------------------------------------------
# Targets
#-----------------------------------------------------------------------

widget: $(widget_out)

styles: $(styles_out)

.PHONY: widget styles

#-----------------------------------------------------------------------
# Rules for the widget
#-----------------------------------------------------------------------
#
# $@: target
# $*: target basename
# $<: first dep
# $^: all deps
# $?: more recent deps

$(widget_out): $(widget_obj)
	dist=$$(dirname $@); test -f $$dist || mkdir -p $$dist
	$(call task, "Assembling $(widget).js", cat $(widget_obj) > $@, true)

%.js.$(jspp_obj): %.js
	$(call task, "Compiling $(notdir $*.js)",                                    \
		$(jspp_bin) clean "$<" | $(uglify_bin) $(uglify_flags) --output "$@" 2>/dev/null, \
	true)

#-----------------------------------------------------------------------
# Rules for the styles
#-----------------------------------------------------------------------

$(styles_out): $(styles_src)
	dist=$$(dirname $@); test -f $$dist || mkdir -p $$dist
	$(call task, "Compiling CSS", (                          \
		$(lessc_bin) $(lessc_flags) $(styles_src_main) > $@;     \
		autoprefixer -b "last 2 versions" $@                     \
	), rm $@)

#-----------------------------------------------------------------------
# Rules for the version file
#-----------------------------------------------------------------------

$(ver_file):
ifneq ($(shell cat $(ver_file) 2>/dev/null || true), $(ver))
	$(call task, "$(ver_file): $(ver)", echo "$(ver)" > $@, true)
endif

.PHONY: $(ver_file)
