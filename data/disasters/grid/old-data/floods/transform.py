import os
import csv
import json

countries_json = open("../countries.json")
countries = json.load(countries_json)


for filename in os.listdir('.') :
    if filename == "transform.py" or filename.startswith("."):
        continue
    
    splittedfilename = os.path.splitext(filename)
    newfilename = splittedfilename[0] + "-transformed" + splittedfilename[1]

    with open(filename, 'rb') as inputcsvfile:
        with open(newfilename, 'wb') as outputcsvfile:

            reader = csv.DictReader(inputcsvfile,delimiter=",")
            fieldnames = ['affected','end_date','deaths','lon','damage','lat','start_date','extra']
            writer = csv.DictWriter(outputcsvfile, fieldnames=fieldnames)
            writer.writeheader()

            for row in reader: 


                ##inconsistency in data#####
                try:
                    float(row["Severity *"])
                except ValueError:
                    continue
                ###########################

                latitude = row['Centroid X']
                longitude = row['Centroid Y']

                year = row ['Began'][-4:]

                deaths = row['Dead']
                affected = 'NULL'
                damage = row['Damage (USD)']
                extra = 'NULL'

                writer.writerow({'affected':affected,'end_date':year,'deaths':deaths,'lon':longitude,'damage':damage,'lat':latitude,'start_date':year,'extra':extra})

                






