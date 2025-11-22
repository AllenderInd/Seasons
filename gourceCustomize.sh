# Remove actions after a certain date (currently December SGX)
cat gourceLog.txt | awk -F\| '$1<=1544637600' > gourceLog.temp
mv gourceLog.temp gourceLog.txt

# Setup Project Name
projName="Seasons - Source Code"

function fix {
  sed -i -- "s/$1/$2/g" gourceLog.txt
}

# Replace non human readable names with proper ones
fix "|CozyD|" "|Cozy Dumas|"
fix "|Dumas|" "|Cozy Dumas|"
fix "|Michael-lange|" "|Michael Lange|"
fix "|Michael-Lange|" "|Michael Lange|"
fix "|allenderind|" "|Chris Allender|"
fix "|AMyersZero|" "|Alex Meyers|"
