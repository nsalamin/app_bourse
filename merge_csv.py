import sys
import shutil

otherfile = sys.argv[1] #get the file name from the command line
standardfile = "vendeur_prix.csv"

#copy vendeur_prix.csv file into a new file using sys module
shutil.copy(standardfile, "vendeur_prix_old.csv")

max_buyer = 0 #higher id of buyer column (index 2)
with open("vendeur_prix_old.csv", "r") as infile, open("vendeur_prix.csv", "w") as outfile:
    line = infile.readline() #read the header, same for both
    outfile.write(line) #write the header to the new file
    for line in infile:
        data = line.split(",")
        col2 = int(data[2])
        if col2 > max_buyer:
            max_buyer = col2  # corrected variable name
        outfile.write(",".join(data))  # write the joined data as a line

with open(otherfile, "r") as tomerge, open("vendeur_prix.csv", "a") as outfile:
    line = tomerge.readline() #same as above
    for line in tomerge:
        data = line.split(",")
        data[2] = str(int(data[2]) + max_buyer) #add to the buyer id the max of the previous data
        outfile.write(",".join(data))