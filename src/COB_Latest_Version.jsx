//GET LATEST VERSION 1.0
//FINDS THE MOST UP-TO-DATE FILE BASED UPON AN ORIGINAL AE FILE AND A SET OF AUTOSAVE FILES
{
	var LV = new Object();
	LV.scriptName		= "Latest Version";
	LV.version 			= "1.0";
	LV.description 	= "This script takes an AE file and compares its modified time to that of those in the auto-save directory for that AE file. It then presents a prompt for the user to select what action they would like to take (open main file, open latest auto-saved file or overwrite the main file with the auto-saved file).";
	LV.mainFile 		= new Object();
	LV.autoSaveDir 	= new Object();
	LV.debug 			= false;
	LV.mainPal 		= null;
	LV.choiceMenu 	= null;
	LV.choiceHelp		= "Option 1: Open the main file.\
Option 2: Open the auto-saved file.\
Option 3: Overwrite the main file with the auto-saved file and open the main file.\
\
NOTE: Overwriting the main file with the auto-saved file cannot be undone so you will be asked to confirm this option. Once you have confirmed, the main file will be overwritten with the auto-saved file (and consequently renamed to the main file's name).";
	//GET THE USER'S OPERATING SYSTEM
	if($.os.indexOf("Windows") != -1){
		LV.os = "Win";
	}else{
		LV.os = "Mac";
	}

	LV.errors = new Object();
	LV.errors.nullAutoSaveDir = "The Adobe After Effects Auto-Save directory could not be found.";
	LV.errors.noAutoSaveFiles = "There aren't any AE projects in the Auto-Save directory associated with the file you selected";
	LV.errors.nullCurrentProj = "You currently do not have an open project to use for reference. Please deselect 'Use Current' and browse for the file you would like to compare or open a project.";
	LV.help = LV.scriptName+" "+LV.version+"\
Description:\n\
Directions:\n\
1. Click on 'Select Project'. If you would like to use the current project's file, select 'Use Current'.\
2. Once you select the main file, the script will begin to compare the modification times of the auto-saved files with that of your selected (main) file. If it cannot find a new auto-saved file, the script will let you know and then quit.\
3. If there is a newer auto-saved file, you will be presented with information about the files and three options:\n\
"+LV.choiceHelp+"\
\
Copyright info:\n\
"+LV.scriptName+" "+LV.version+" by Collin Brooks is licensed under a Creative Commons Attribution-Share Alike 3.0 United States License. <http://creativecommons.org/licenses/by-sa/3.0/us/>\
\
Contact:\n\
Collin Brooks <collin.brooks@gmail.com>";
	
	//CREATE VARS FOR THE FIRST TIME
	resetVars();
	
	function outputLn(theText)
	{
		if(LV.debug)
		{
			$.writeln(theText);
		}
	}
	
	function error(e)
	{
		outputLn("Outputting Error");
		alert("LATEST VERSION (v"+LV.version+") ERROR:\n"+e);
	}
	
	function resetVars()
	{	
		outputLn("Reseting Variables");
		LV.mainFile.file = null;
		LV.mainFile.name = null;
		LV.mainFile.parentFolder = null;
		LV.mainFile.modifiedTime = null;
		
		LV.autoSaveDir.folder = null;
		LV.autoSaveDir.files = new Array();
		LV.autoSaveDir.latestFile = null;
	}
	
	function filterAEPFiles(f)
	{
		if(f.name.lastIndexOf(".aep") != -1)
		{
			return true;
		}else{
			return false;
		}
	}

	function getLessonFilesFromAutoSave(f)
	{
		//FILTER OUT THE FILES THAT DON'T MATCH THE NAME OF THE SELECTED PROJECT FILE
		var n = LV.mainFile.file.name.substr(0, LV.mainFile.file.name.length-4);
		if(f.name.indexOf(n) != -1 && filterAEPFiles(f))
		{
			outputLn("Name of Main File minus extension: "+n);
			return true;
		}else{
			return false;
		}
	}

	function openMainFile()
	{
		proceedWithChoice("Main");
	}
	
	function openAutoSavedFile()
	{
		proceedWithChoice("Auto-saved");
	}
	
	function overwriteMainFile()
	{
			if(confirm("Are you sure you want to overwrite the main file with the auto-saved file?"))
			{
				proceedWithChoice("Overwrite");
			}
	}

	function choiceHelpAlert()
	{
		alert("You have three options:\n"+LV.choiceHelp);
	}

	function proceedWithChoice(c)
	{
		var fto = null; /*The file to open*/
		var err = false; /*For error*/
		
		/*Close the choice menu*/
		LV.choiceMenu.close();
		
		/*
		**See if we need to close the project.
		*/
		if(app.project != null)
		{
			/*Close the project*/
			app.project.close(CloseOptions.PROMPT_TO_SAVE_CHANGES);
		}
	
		switch(c)
		{
				case "Main":
					/*
					**Set the main file as the file to open
					*/
					fto = LV.mainFile.file;
					break;
				case "Auto-saved":
					/*
					**Set the Auto-saved file as the file to open
					*/
					fto = LV.autoSaveDir.latestFile;
					break;
				case "Overwrite":
					/*
					**Perform overwrite of the main file with the auto-saved file
					*/
					if(!LV.autoSaveDir.latestFile.copy(LV.mainFile.file))
					{
						/*The file could not be copied, error out*/
						err = true;
						alert(LV.errors.fileNotCopied);
					}else{
						fto = LV.mainFile.file;
					}				
					break;
		}
		/*
		**Open the file
		*/
		if(!err)
		{
			app.open(fto);
		}
	}

	function getLatestVersion()
	{
		outputLn("====================");
		outputLn("Looking for latest version...");
		outputLn("====================");
		outputLn("User's OS is: "+LV.os);
		if(LV.thePal.grp.selectGroup.useCurrent.value == 0)
		{
			//OPEN UP A FILE SELECTION DIALOG WITH ONLY .AE FILES AVAILABLE
			if(LV.os = "Win")
			{
				LV.mainFile.file = File.openDialog("Select the main AE file", "*.aep");
			}else{
				LV.mainFile.file = File.openDialog("Select the main AE file", filterAEPFiles);
			}
		}else{
			if(app.project.file != null)
			{
				LV.mainFile.file = app.project.file;
			}else{
				alert(LV.errors.nullCurrentProj);
			}
		}
	
		if(LV.mainFile.file != null)
		{
		
		//GET THE PROPERTIES OF THE SELECTED FILE
		LV.mainFile.name = LV.mainFile.file.name;
			outputLn("Selected File's Name: "+ LV.mainFile.name);
		LV.mainFile.parentFolder = LV.mainFile.file.parent;
			outputLn("Selected File's Parent Folder: "+ LV.mainFile.parentFolder.absoluteURI);
		
		//GET A LIST OF FILES IN THE AUTO SAVE FOLDER
		LV.autoSaveDir.folder = new Folder(LV.mainFile.parentFolder.relativeURI+"/Adobe After Effects Auto-Save");
			outputLn("Auto-save folder location: "+LV.autoSaveDir.folder.absoluteURI);
		
			if(LV.autoSaveDir.folder != null)
			{			
				outputLn("Getting a list of files in the auto save folder");
				LV.autoSaveDir.files = LV.autoSaveDir.folder.getFiles(getLessonFilesFromAutoSave);
					outputLn("Number of matching files in Auto-save folder: "+LV.autoSaveDir.files.length);
			}else{
				error(LV.errors.nullAutoSaveDir);
			}
			
			if(LV.autoSaveDir.files.length == 0)
			{
				error(LV.errors.noAutoSaveFiles);
			}else{
				LV.mainFile.modifiedTime = LV.mainFile.file.modified.getTime();
				//OF ALL OF THE AUTO-SAVE FILES, FIND THE ONE THAT HAS THE LATEST DATE
				var newestFileIndex = 0;
				var highestTime = 0;
				var currentFileTime;
					outputLn("Comparing file times...");
				for(f=LV.autoSaveDir.files.length-1;f>=0;f--)
				{
					currentFileTime = LV.autoSaveDir.files[f].modified.getTime();
					outputLn("Current file time difference: "+currentFileTime-LV.mainFile.modifiedTime);
					if(currentFileTime > highestTime)
					{
						highestTime = currentFileTime;
							outputLn("New high time: "+highestTime);
						newestFileIndex = f;
					}
				}
				
				LV.autoSaveDir.latestFile = LV.autoSaveDir.files[newestFileIndex];
				
				//COMPARE THE DATE OF THE AUTO-SAVED FILE TO THE PROJECT FILE THAT WAS SELECTED
				
				if(LV.autoSaveDir.latestFile.modified.getTime() > LV.mainFile.modifiedTime)
				{
					var headingText = "The auto-saved file "+File.decode(LV.autoSaveDir.latestFile.name)+" is more up to date than the file you selected.";
					choiceMenu(headingText);
					LV.choiceMenu.center();
					LV.choiceMenu.show();
				}else{
					alert("The file you selected is the most up-to-date version of this project");
				}
				
			}
		}
		//OTHERWISE, TELL THE USER THAT AN AUTO-SAVED FILE IS MORE UP-TO-DATE
		//AND GIVE THEM THE OPPORTUNITY TO EITHER OPEN THE FILE OR REPLACE THE
		//ORIGINALLY SELECTED FILE WITH THE AUTO-SAVED VERSION
	}

	function help()
	{
		alert(LV.help);
	}
	
	function LatestVersionBuildUI(thisObj)
	{
		LV.thePal = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Latest Version", undefined, {resizeable:false});
		
		if(LV.thePal != null)
		{
			//MAIN UI RESOURCE SETUP
			var res =
			"group { \
			orientation: 'column', \
			margins:2, \
			alignment:['fill','fill'], \
				selectProjButton: Button {text: 'Select Project', alignment:'right', size:[125,20]}, \
				selectGroup: Group {orientation: 'row', alignment: 'center', \
					useCurrent: Checkbox {text: 'Use Current'},\
					helpButton: Button {text: '?', alignment:'right', size: [20, 20]} \
				}\
			}";

			LV.thePal.grp = LV.thePal.add(res);
			LV.thePal.layout.layout(true);
			LV.thePal.onResizing = LV.thePal.onResize = function() {this.layout.resize();}
			
			// Workaround to ensure the edittext text color is black, even at darker UI brightness levels
			var winGfx = LV.thePal.graphics;
			var darkColorBrush = winGfx.newPen(winGfx.BrushType.SOLID_COLOR, [0,0,0], 1);
			
			LV.thePal.grp.selectProjButton.graphics.foregroundColor = darkColorBrush;
			
			//SET UP DIALOG FUNCTIONS
			LV.thePal.grp.selectProjButton.onClick = getLatestVersion;
			LV.thePal.grp.selectGroup.helpButton.onClick = help;
		
			return LV.thePal;
		}
	}

	function choiceMenu(headText)
	{
		outputLn("Opening choice menu");
		LV.choiceMenu = new Window("palette", "There is a newer auto-saved version!", undefined, {resizeable:false});
		outputLn("Choice Menu Created");
		if(LV.choiceMenu != null)
		{
			//MAIN UI RESOURCE SETUP
			outputLn("Creating menu resources");
			var choiceRes =	"group { \
			orientation: 'column', \
			margins:2, \
			size: [350, 400], \
			alignment:['fill','fill'], \
				headText: StaticText {text: '"+headText+"', alignment:'center'}, \
				comparisonGroup: Group {orientation:'row', alignment: 'center', \
					mainFileGroup: Panel {orientation:'column', alignment:'center', text:'Main File Info',  \
						heading: StaticText {alignment:'left', text: '"+File.decode(LV.mainFile.file.name)+"'}, \
						dateInfo: StaticText {alignment:'left', text: '"+LV.mainFile.file.modified.toDateString()+" "+LV.mainFile.file.modified.toTimeString()+"'},\
						selectMainButton: Button {text: 'Open Main File', alignment:['fill','fill']}, \
					}, \
					autoSavedFileGroup: Panel {orientation:'column', alignment: 'center', text:'Latest Auto-saved File Info', \
						heading: StaticText {alignment:'left', text: '"+File.decode(LV.autoSaveDir.latestFile.name)+"'}, \
						dateInfo: StaticText {alignment:'left', text: '"+LV.autoSaveDir.latestFile.modified.toDateString()+" "+LV.autoSaveDir.latestFile.modified.toTimeString()+"'}, \
						selectAutoSavedButton: Button {text: 'Open Auto-saved File',  alignment:['fill','fill']} \
					} \
				}, \
				selectionGroup: Group {orientation: 'row', alignment: 'center', \
					overwriteMainButton: Button {text: 'Overwrite Main File', alignment:['fill','fill']}, \
					cancelButton : Button {text:'Cancel', alignment:'center', size:[125,20]}, \
					helpButton: Button {text: '?', alignment:'right', size: [20, 20]} \
				}\
			}";

			outputLn("Adding resource to the menu");
			LV.choiceMenu.grp = LV.choiceMenu.add(choiceRes);
			LV.choiceMenu.layout.layout(true);
			LV.choiceMenu.onResizing = LV.choiceMenu.onResize = function() {this.layout.resize();}
			
			//SET UP FUNCTIONS
			outputLn("Creating functions for choice menu");
			LV.choiceMenu.grp.comparisonGroup.mainFileGroup.selectMainButton.onClick = openMainFile;
			LV.choiceMenu.grp.comparisonGroup.autoSavedFileGroup.selectAutoSavedButton.onClick = openAutoSavedFile;
			LV.choiceMenu.grp.selectionGroup.overwriteMainButton.onClick = overwriteMainFile;
			LV.choiceMenu.grp.selectionGroup.cancelButton.onClick = function() {LV.choiceMenu.close();};
			LV.choiceMenu.grp.selectionGroup.helpButton.onClick = choiceHelpAlert;
			
			outputLn("Choice Menu Created");
			return true;
		}
	}
/*******************************************************\
************************ MAIN ***************************
\*******************************************************/

	LV.mainPal = LatestVersionBuildUI(this);

	if(LV.mainPal != null)
	{
		if(LV.mainPal instanceof Window)
		{
			LV.mainPal.center();
			LV.mainPal.show();
		}else{
			LV.mainPal.layout.layout(true);
		}
	}
}
