import os
import csv
import json

with open("fires-transformed.csv", 'wb') as outputcsvfile:
    fieldnames = ['affected','end_date','deaths','lon','damage','lat','start_date','extra']
    writer = csv.DictWriter(outputcsvfile, fieldnames=fieldnames)
    writer.writeheader()

    for filename in os.listdir('.') :

        if filename == "transform.py" or filename.startswith(".") or filename == "fires.csv":
            continue
            

        with open(filename, 'rb') as inputfile:

            for line in inputfile: 

                line = line.split()

                latitude = line[3]
                longitude = line[4]
                year = line[0][:4]
                deaths = 'NULL'
                affected = 'NULL'
                damage = 'NULL'
                extra = 'NULL'

                writer.writerow({'affected':affected,'end_date':year,'deaths':deaths,'lon':longitude,'damage':damage,'lat':latitude,'start_date':year,'extra':extra})








