COB LATEST VERSION
==================

The point of this application is to allow the user to easily and quickly
determine whether or not an AE file is the most up-to-date compared to its
auto-saved versions.


==Description:==

If you've used After Effects for a while, you'll know how frustrating it can be
to have After Effects crash on you. Sure, After Effects has an "Auto-Save"
feature where files can be automatically saved at specified intervals but, even
so, you still have to figure out which version of your After Effects file is
the most up-to-date: your original AE file or an auto-saved version. This can
be frustrating in that you have to manually compare modiciation times of your
AE file and its most recent auto-saved version. Why add frustration to an
already frustrating situation?

Introducing Latest Version, a script that takes an AE file and compares its
modified time to that of those in its auto-save directory and presents an easy
to understand prompt for you to select what action you would like to take (open
main file, open latest auto-saved file or overwrite the main file with the
auto-saved file).

**Note:** This script is useless if you do not use After Effect's auto-save
feature.

==Why would I use it?==

While not everyone enjoys using After Effect's "auto-save" feature, the author
of this script has been saved (no pun intended) multiple times from losing
precious minutes of work by having After Effects save every 5 minutes. It makes
him happy knowing that he will only lose 5 minutes of work if After Effects
decides to crash while he is working on a time-sensitive project. However, the
inefficiency of having to browse for his AE project file to figure out if it is
more up-to-date than an auto-saved version frustrates him and makes him want to
cry. If you too wish there was an easier way to determine if your After Effects
file is more up-to-date than its latest auto-saved file, then this script is
for you.

However, if you live on the wild side and enjoy testing fate by not using After
Effect's auto-save feature, or you enjoy browsing through your file system to
manually compare file modification times, I salute you but, this script is not
for you.

==Directions:==

1. Click on 'Get Latest Version'. This will bring up a dialog window allowing
   you to select the After Effects project to use as the file to search for
   newer versions of. If you would like to use the current project as the main
   file, select 'Use Current Project' and then click on 'Get Latest Version'.
2. Once you select the main file, the script will begin to compare the
   modification times of the auto-saved files with that of your selected (main)
   file. If it cannot find a new auto-saved file, the script will let you know
   and then quit.
3. If there is a newer auto-saved file, you will be presented with information
   about the files and three options:

    * Option 1: Open the main file. 
    * Option 2: Open the auto-saved file. 
    * Option 3: Overwrite the main file with the auto-saved file and open the
      main file.

      **NOTE:** Overwriting the main file with the auto-saved file cannot be
      undone so you will be asked to confirm this option. Once you have
      confirmed, the main file will be overwritten with the auto-saved file
      (and consequently renamed to the main file's name).

4. Click on one of the three options presented to execute the option.

==Copyright info:==

COB Latest Version by Collin Brooks is licensed under the Apache License,
Version 2.0 (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.

==Contact:==

Collin Brooks <collin.brooks@gmail.com>
