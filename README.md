COB LATEST VERSION
==================

The point of this application is to allow the user to easily and quickly
determine whether or not an AE file is the most up-to-date compared to its
auto-saved versions.


==Description:==

This script takes an AE file and compares its modified time to that of those in
its auto-save directory. It then presents a prompt for the user to select what
action they would like to take (open main file, open latest auto-saved file or
overwrite the main file with the auto-saved file).

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
