/**
 * @fileoverview Finds the most up-to-date file based upon an original AE
 * file and a set of autosave files.
 *
 * The point of this application is to allow the user to easily and quickly
 * determine whether or not an AE file is the most up-to-date compared to its
 * auto-saved versions.
 *
 * Copyright 2011 Collin D Brooks <collin.brooks@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author Collin D Brooks <collin.brooks@gmail.com>
 * @version 1.0.1
 */

/**
 * jslint white: true, onevar: true, undef: true, newcap: true, nomen: true, 
 * regexp: false, plusplus: true, bitwise: true, maxerr: 200, maxlen: 79,
 * indent: 4
 */                 

/*global app, $, File, Folder, alert, prompt, clearOutput, writeLn, write,
confirm, Window, Panel, localize, unescape, TimecodeDisplayType,
timeToCurrentFormat, CloseOptions*/

/**
 * The main COB namespace
 * @namespace
 */
var COB = COB || {};

//Comment out for production
COB.LV = undefined;

COB.LV = (function LV(globalObj) {

// Public Properties:
//----------------------------------------------------------------------------

    /**
     * The name of this script
     * @type {String}
     */
    this.scriptName = "Latest Version";
    /**
     * The current version of this script
     * @type {String}
     */
    this.version = "1.0.1";

// Private Properties:
//----------------------------------------------------------------------------
    
    /**
     * A reference to COB.LV
     * @type {COB.LV}
     */
    var that = this,
        
        /**
         * Object containing information about the main file.
         * @type {Object}
         */
        mainFile = {},

        /**
         * Object containint information about the auto-save directory.
         * @type {Object}
         */
        autoSaveDir = {},

        /**
         * Whether or not to display debug messages.
         * @type {Boolean}
         */
        debug = true,

        /**
         * The user's operating system (Win or Mac).
         * @type {String}
         */
        os = ($.os.indexOf("Windows") !== -1) ? "Win" : "Mac",

        /**
         * The UI Object for the COB.LV script. This object contains the main
         * pallette and the choice menu window.
         * @type {Object}
         */
        UI = {},

        /**
         * Class that keeps track of events and fires them when called.
         * @private
         * @class
         * @name COB.LV-EventManager
         */
        EventManager = function () {
            /* Event Listeners */
            var events = [];
            this.addEventListener = function (e, f) {
                events[e] = function () {
                    f();
                };
            };

            this.removeEventListener = function (e) {
                events[e] = null;
            };

            this.fire = function (e) {
                return function () {
                    if (typeof events[e] === "function") {
                        events[e]();
                    } else {
                        return null;
                    }
                };
            };
            return this;
        },

        /**
         * Language strings used by the COB.lV script.
         * @type {Object}
         */
        lang,
        errors;

    lang = {
        choiceHelp: {en: "Option 1: Open the main file. \n" +
            "Option 2: Open the auto-saved file. \n" +
            "Option 3: Overwrite the main file with the auto-saved " +
                "file and " +
            "open the main file.\n\n" +
            "NOTE: Overwriting the main file with the auto-saved file " +
            "cannot be undone so you will be asked to confirm this " +
            "option. Once you have confirmed, the main file will be " +
            "overwritten with the auto-saved file " +
            "(and consequently renamed to the main file's name)."}, 
        help: {en:  that.scriptName + " " + that.version + "\n" +
            "Description:\n" +
            "This script takes an AE file and compares its " +
            "modified time to that of those in the auto-save directory " +
            "for that AE file. It then presents a prompt for the user " +
            "to select what action they would like to take (open " +
            "main file, open latest auto-saved file or overwrite the " +
            "main file with the auto-saved file).\n\n" +

            "Directions:\n" +
            "1. Click on 'Select Project'. If you would like to use " +
            "the current project's file, select 'Use Current'.\n" +
            "2. Once you select the main file, the script will begin " +
            "to compare the modification times of the auto-saved " +
            "files with that of your selected (main) file. If it " +
            "cannot find a new auto-saved file, the script will " +
            "let you know and then quit.\n" +
            "3. If there is a newer auto-saved file, you will be " +
            "presented with information about the files and " +
            "three options:\n\n" +
            "Option 1: Open the main file. \n" +
            "Option 2: Open the auto-saved file. \n" +
            "Option 3: Overwrite the main file with the auto-saved " +
            "file and open the main file.\n\n" +
            "NOTE: Overwriting the main file with the auto-saved " +
            "file cannot be undone so you will be asked to confirm " +
            "this option. Once you have confirmed, the main file " +
            "will be overwritten with the auto-saved file " +
            "(and consequently renamed to the main file's name).\n\n" +

            "Copyright info:\n" +
            that.scriptName + " " + that.version + " by Collin Brooks " +
            "is licensed under the Apache License, Version 2.0 (the " +
            "\"License\"); you may not use this file except in compliance " +
            "with the License. You may obtain a copy of the License at\n\n" +
            " http://www.apache.org/licenses/LICENSE-2.0\n\n" +
            "Unless required by applicable law or agreed to in writing, " +
            "software distributed under the License is distributed on an " +
            "\"AS IS\" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, " +
            "either express or implied. See the License for the specific " +
            "language governing permissions and limitations under " +
            "the License.\n\n" +                                          
            "Contact:\n\n" +
            "Collin Brooks <collin.brooks@gmail.com>"},
        selectProject: {en: "Get Latest Version"},
        useCurrent: {en: 'Use Current Project'},
        newerAutoSave: {en: 'There is a newer auto-saved version!'},
        mainFileInfo: {en: 'Main File Info'},
        openMainFile: {en: 'Open Main File'},
        openAutoSavedFile: {en: 'Open Auto-saved File'},
        overwriteMainFile: {en: 'Overwrite Main File'},
        cancel: {en: 'Cancel'},
        threeOptions: {en: 'You have three options:'},
        overwriteConfirmation: {en: 'Are you sure you want to ' +
            'overwrite the main file with the auto-saved file?'},
        selectMainAEFile: {en: 'Select the main AE file'},
        choiceHeadingText: {en: 'The auto-saved file %1 is more ' +
            'up to date than the file you selected.'},
        mostUpToDate: {en: 'The file you selected is the most ' +
            'up-to-date version of this project.'},
        doOpenMainFile: {en: 'Would you like to open it?' },
        latestAutoSaveInfo: {en: 'Latest Auto-saved File Info'}
    };

    errors = {
        NULL_AUTO_SAVE_DIR: "The Adobe After Effects Auto-Save " +
            "directory could not be found.",
        NO_AUTO_SAVE_FILES: "There aren't any AE projects in " +
            "the Auto-Save directory associated with the file " +
            "you selected",
        NULL_CURRENT_PROJ: "You currently do not have an open " +
            "project to use for reference. Please deselect " +
            "'Use Current' and browse for the file you " +
            "would like to compare or open a project."
    };

// Private Methods:
//----------------------------------------------------------------------------

    /**
     * A reference to the main pallete of the COB.LV UI
     * @type {Window|Palette}
     */
    UI.mainPal = (function mainPal(globalObj) {
        var thePal = (globalObj instanceof Panel) ?
                globalObj :
                new Window(
                    "palette",
                    that.scriptName + " " + that.version,
                    undefined,
                    {resizeable: false}
                ),
            res, winGfx, darkColorBrush,
            l = localize,
            /**
             * Shortcut reference to thePal.grp.
             * @type {Group}
             */
            g,
            e = new EventManager();
        
        if (thePal !== null) {
            //MAIN UI RESOURCE SETUP
            res = "group { " +
                "orientation: 'column', " +
                "margins:2, " +
                "alignment:['fill','fill'], " +
                "selectProjButton: Button {" +
                    "text:'" + l(lang.selectProject) + "' ," +
                    "alignment:['fill', 'fill']," +
                    "size:[125,20]" +
                "}," +
                "selectGroup: Group {" +
                    "orientation: 'row'," +
                    "alignment: 'center'," +
                    "useCurrent: Checkbox {" +
                        "text:'" + l(lang.useCurrent) + "'" +
                    "}," +
                    "helpButton: Button {" +
                        "text: '?'," +
                        "alignment:'right'," +
                        "size: [20, 20]" +
                    "}" +
                "}" +
            "}";

            thePal.grp = thePal.add(res);
            thePal.layout.layout(true);
            thePal.onResizing = thePal.onResize = function () {
                this.layout.resize();
            };
            
            // Workaround to ensure the edittext text color is black, even at
            // darker UI brightness levels
            winGfx = thePal.graphics;
            darkColorBrush = winGfx.newPen(
                winGfx.BrushType.SOLID_COLOR,
                [0, 0, 0],
                1
            );
            
            g = thePal.grp;
            g.selectProjButton.graphics.foregroundColor = darkColorBrush;
            
            //SET UP DIALOG FUNCTIONS
            g.selectProjButton.onClick = e.fire("onGetLatestVersion");
            g.selectGroup.helpButton.onClick = e.fire("onMainPalHelp");
        
            return {
                show: function () {
                    if (thePal instanceof Window)
                    {
                        thePal.center();
                        thePal.show();
                    } else {
                        thePal.layout.layout(true);
                    }
                },
                useCurrentProject: function () {
                    return thePal.grp.selectGroup.useCurrent.value; 
                },
                addEventListener: e.addEventListener,
                removeEventListener: e.removeEventListener
            };
        }
    }(globalObj));
    
    function outputLn(theText) {
        if (debug) {
            $.writeln(theText);
        }
    }

    /**
     * The pop-up choice menu of the COB.LV UI
     * @type {Window}
     */

    UI.choiceMenu = (function choiceMenu() {
        var l = localize,
            choiceWin,
            res,
            /**
             * A pointer to choiceMenu.grp.
             * @type {Group}
             */
            g,
            e = new EventManager();

        outputLn("Opening choice menu");
        choiceWin = new Window("palette", "", undefined, {resizeable: false});
        outputLn("Choice Menu Created");
        if (choiceWin !== null) {
            //MAIN UI RESOURCE SETUP
            outputLn("Creating menu resources");
            res = "group { " +
                "orientation: 'column', " +
                "margins:2, " +
                "size: [350, 400], " +
                "alignment:['fill','fill'], " +
                "headText: StaticText {" +
                    "text: ''," +
                    "alignment:'center'" +
                "}, " +
                "comparisonGroup: Group {" +
                    "orientation:'row'," +
                    "alignment: 'center', " +
                    "mainFileGroup: Panel {" +
                        "orientation:'column'," +
                        "alignment:'center'," +
                        "text:'" + l(lang.mainFileInfo) + "'," +
                        "heading: StaticText {" +
                            "alignment:'left'," +
                            "text: ''" +
                        "}, " +
                        "dateInfo: StaticText {" +
                            "alignment:'left'," +
                            "text: ''" +
                        "}," +
                        "selectMainButton: Button {" +
                            "text:'" + l(lang.openMainFile) + "'," +
                            "alignment:['fill','fill']" +
                        "}, " +
                    "}, " +
                    "autoSavedFileGroup: Panel {" +
                        "orientation:'column'," +
                        "alignment: 'center'," +
                        "text:'" + l(lang.latestAutoSaveInfo) + "'," +
                        "heading: StaticText {" +
                            "alignment:'left'," +
                            "text: ''" +
                        "}, " +
                        "dateInfo: StaticText {" +
                            "alignment:'left'," +
                            "text: ''" +
                        "}, " +
                        "selectAutoSavedButton: Button {" +
                            "text:'" + l(lang.openAutoSavedFile) + "'," +
                            "alignment:['fill','fill']" +
                        "} " +
                    "} " +
                "}, " +
                "selectionGroup: Group {" +
                    "orientation: 'row'," +
                    "alignment: 'center'," +
                    "overwriteMainButton: Button {" +
                        "text:'" + l(lang.overwriteMainFile) + "'," +
                        "alignment:['fill','fill']" +
                    "}, " +
                    "cancelButton : Button {" +
                        "text:'" + l(lang.cancel) + "'," +
                        "alignment:'center'," +
                        "size:[125,20]" +
                    "}, " +
                    "helpButton: Button {" +
                        "text: '?'," +
                        "alignment:'right'," +
                        "size: [20, 20]" +
                    "}" +
                "}" +
            "}";

            outputLn("Adding resource to the menu");
            choiceWin.grp = choiceWin.add(res);

            g = choiceWin.grp;
            
            //SET UP FUNCTIONS
            outputLn("Creating functions for choice menu");
            g.comparisonGroup.mainFileGroup.selectMainButton.onClick = 
                e.fire("onOpenMainFile");
            g.comparisonGroup.autoSavedFileGroup.
                    selectAutoSavedButton.onClick =
                e.fire("onOpenAutoSavedFile");
            g.selectionGroup.overwriteMainButton.onClick =
                e.fire("onOverwriteMainFile");
            g.selectionGroup.cancelButton.onClick =
                function () {
                    choiceWin.close();
                };
            g.selectionGroup.helpButton.onClick =
                e.fire("onChoiceHelpAlert");
            
            outputLn("Choice Menu Created");
            return {
                init: function (headText) {
                    g.headText.text = headText;

                    //Set the UI info based upon the now-initialized mainFile
                    //and autoSaveDir properties.
                    g.comparisonGroup.mainFileGroup.heading.text =
                        File.decode(mainFile.file.name);
                    g.comparisonGroup.mainFileGroup.dateInfo.text =
                        mainFile.file.modified.toDateString() + " " +
                        mainFile.file.modified.toTimeString();
                    g.comparisonGroup.autoSavedFileGroup.heading.text =
                        File.decode(autoSaveDir.latestFile.name);
                    g.comparisonGroup.autoSavedFileGroup.dateInfo.text =
                        autoSaveDir.latestFile.modified.toDateString() +
                        " " + autoSaveDir.latestFile.modified.toTimeString();

                    choiceWin.layout.layout(true);
                    choiceWin.onResizing = choiceWin.onResize = function () {
                        this.layout.resize();
                    };

                },
                show: function () {
                    choiceWin.center();
                    choiceWin.show();
                },
                addEventListener: e.addEventListener,
                removeEventListener: e.removeEventListener,
                close: function () {
                    choiceWin.close();
                }
            };
        }
    }());

    function error(e) {
        outputLn("Outputting Error");
        alert("LATEST VERSION (v" + that.version + ") ERROR:\n" + e);
    }

    function resetVars() {	
        outputLn("Reseting Variables");
        mainFile.file = null;
        mainFile.name = null;
        mainFile.parentFolder = null;
        mainFile.modifiedTime = null;
        
        autoSaveDir.folder = null;
        autoSaveDir.files = [];
        autoSaveDir.latestFile = null;
    }

    /**
     * Returns whether or not a file has .aep as its extension.
     * @returns {Boolean} True if the file contains .aep or false if it
     * doesn't.
     */
    function filterAEPFiles(f) {
        if (f.name.lastIndexOf(".aep") !== -1 || f instanceof Folder) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Filters out files that do not belong to the selected after effects
     * file's autosave naming convention.
     * @returns {Boolean} True if the file belongs or false if it doesn't.
     */
    function getFilesFromAutoSave(f) {
        //Filter out the files that don't match the name of the selected
        //project file
        var n = mainFile.file.name.substr(0, mainFile.file.name.length - 4);
        if (f.name.indexOf(n) !== -1 && filterAEPFiles(f)) {
            outputLn("Name of Main File minus extension: " + n);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Proceeds with the user's choice from the choiceMenu. All of the choices'
     * actions are grouped within this function since they all require the same
     * pre-checks and pre-operations.
     * @returns Nothing.
     */
    function proceedWithChoice(c) {
        var fto, err;

        fto = null;  //The file to open
        err = false; //For error
        
        //Close the choice menu
        UI.choiceMenu.close();
        
        //See if we need to close the project.
        if (app.project !== null) {
            //Close the project
            app.project.close(CloseOptions.PROMPT_TO_SAVE_CHANGES);
        }

        switch (c) {
        case "Main":
            //Set the main file as the file to open
            fto = mainFile.file;
            break;
        case "Auto-saved":
            //Set the Auto-saved file as the file to open
            fto = autoSaveDir.latestFile;
            break;
        case "Overwrite":
            //Perform overwrite of the main file with the auto-saved file
            if (!autoSaveDir.latestFile.copy(mainFile.file)) {
                //The file could not be copied, error out
                err = true;
                alert(errors.fileNotCopied);
            } else {
                fto = mainFile.file;
            }				

            break;
        }
        //
        //Open the file
        if (!err) {
            app.open(fto);
        }
    }

    /**
     * Helper function that calls proceedWithChoice("Main").
     * @returns Nothing.
     */
    function openMainFile() {
        proceedWithChoice("Main");
    }

    /**
     * Helper function that calls proceedWithChoice("Auto-saved").
     * @returns Nothing.
     */
    function openAutoSavedFile() {
        proceedWithChoice("Auto-saved");
    }

    /**
     * Confirms the user really wants to overwrite the main file and then calls
     * proceedWithchoice("Overwrite").
     * @returns Nothing.
     */
    function overwriteMainFile() {
        var l = localize;
        if (confirm(l(lang.overwriteConfirmation))) {
            proceedWithChoice("Overwrite");
        }
    }

    /**
     * Displays an alert box with the choice selection help.
     * @returns Nothing.
     */
    function choiceHelpAlert() {
        var l = localize;
        alert(l(lang.threeOptions) + "\n" + l(lang.choiceHelp));
    }


    function getLatestVersion() {
        var newestFileIndex, highestTime, currentFileTime, headingText,
            askToOpen,
            useCurrentProject = UI.mainPal.useCurrentProject(),
            l = localize, f;


        outputLn("====================");
        outputLn("Looking for latest version...");
        outputLn("====================");
        outputLn("User's OS is: " + os);

        if (useCurrentProject  === false) {
            //OPEN UP A FILE SELECTION DIALOG WITH ONLY .AE FILES AVAILABLE
            if (os === "Win") {
                mainFile.file = File.openDialog(
                    l(lang.selectMainAEFile),
                    "*.aep"
                );
            } else {
                mainFile.file = File.openDialog(
                    l(lang.selectMainAEFile),
                    filterAEPFiles
                );
            }
        } else {
            if (app.project.file !== null) {
                mainFile.file = app.project.file;
            } else {
                alert(errors.nullCurrentProj);
            }
        }

        if (mainFile.file !== null) {
        
        //Get the properties of the selected file
            mainFile.name = mainFile.file.name;
            outputLn("Selected File's Name: " + mainFile.name);
            mainFile.parentFolder = mainFile.file.parent;
            outputLn("Selected File's Parent Folder: " +
                mainFile.parentFolder.absoluteURI);
            
            //GET A LIST OF FILES IN THE AUTO SAVE FOLDER
            autoSaveDir.folder = new Folder(
                mainFile.parentFolder.relativeURI +
                "/Adobe After Effects Auto-Save"
            );
            outputLn("Auto-save folder location: " +
                autoSaveDir.folder.absoluteURI);
        
            if (autoSaveDir.folder !== null) {			
                outputLn("Getting a list of files in the auto save folder");
                autoSaveDir.files = autoSaveDir.folder.getFiles(
                    getFilesFromAutoSave
                );
                outputLn("Number of matching files in Auto-save folder: " +
                    autoSaveDir.files.length);
            } else {
                error(errors.NULL_AUTO_SAVE_DIR);
            }
            
            if (autoSaveDir.files.length === 0) {
                error(errors.NO_AUTO_SAVE_FILES);
            } else {
                mainFile.modifiedTime = mainFile.file.modified.getTime();
                
                //Of all of the auto-save files, find the one that has the
                //latest date
                newestFileIndex = 0;
                highestTime = 0;
                outputLn("Comparing file times...");
                outputLn("autoSaveDir.files.length: " +
                    autoSaveDir.files.length);
                for (f = autoSaveDir.files.length - 1; f >= 0; f -= 1) {
                    currentFileTime = autoSaveDir.files[f].modified.getTime();
                    outputLn("Current file time difference: " +
                        currentFileTime - mainFile.modifiedTime);
                    if (currentFileTime > highestTime) {
                        highestTime = currentFileTime;
                        outputLn("New high time: " + highestTime);
                        newestFileIndex = f;
                    }
                }
                
                autoSaveDir.latestFile = autoSaveDir.files[newestFileIndex];
                
                //Compare the date of the auto-saved file to the project file
                //that was selected
                
                if (autoSaveDir.latestFile.modified.getTime() >
                        mainFile.modifiedTime) {
                    headingText = l(
                        lang.choiceHeadingText,
                        File.decode(autoSaveDir.latestFile.name)
                    );
                    UI.choiceMenu.init(headingText);
                    UI.choiceMenu.show();
                } else {
                    if (useCurrentProject) {
                        alert(l(lang.mostUpToDate));
                    } else {
                        if (confirm(l(lang.mostUpToDate) +
                                l(lang.doOpenMainFile))) {
                            app.open(mainFile.file);
                        }
                    }
                }
                
            }
        }
    }

    function help() {
        var l = localize,
            helpWindow = new Window("dialog",
					that.scriptName + " Help",
					undefined,
					{resizeable: false}
					);

        helpWindow.grp = helpWindow.add(
            "group { orientation: 'column', margins:0," +
                "alignment: ['fill','fill'], size: [350, 450]," +
                    "content: EditText {properties: {multiline:true}," +
                    "alignment: ['fill', 'fill']," +
                        "size: [350,430]}," +
                    "b: Button {text: 'Ok'}" +
            "}");

        helpWindow.grp.b.onClick = function () {
            helpWindow.close();
        };

        helpWindow.layout.layout(true);
        helpWindow.center();
        helpWindow.grp.content.text = l(lang.help);
        helpWindow.show();
    }

    //Set event listeners for the UI
    UI.mainPal.addEventListener("onGetLatestVersion", getLatestVersion);
    UI.mainPal.addEventListener("onMainPalHelp", help);

    UI.choiceMenu.addEventListener("onOpenMainFile", openMainFile);
    UI.choiceMenu.addEventListener("onOpenAutoSavedFile", openAutoSavedFile);
    UI.choiceMenu.addEventListener("onOverwriteMainFile", overwriteMainFile);
    UI.choiceMenu.addEventListener("onChoiceHelpAlert", choiceHelpAlert);


    return {
        init: function () {
            resetVars();
            UI.mainPal.show();
        }
    };
}(this));

COB.LV.init();
