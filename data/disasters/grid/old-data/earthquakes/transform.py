import os
import csv
import json

with open("earthquakes-transformed.csv", 'wb') as outputcsvfile:
    fieldnames = ['affected','end_date','deaths','lon','damage','lat','start_date','extra']
    writer = csv.DictWriter(outputcsvfile, fieldnames=fieldnames)
    writer.writeheader()

    for filename in os.listdir('.') :

        if filename == "transform.py" or filename.startswith(".") or filename == "earthquakes.csv":
            continue
            

        with open(filename, 'rb') as inputcsvfile:

            reader = csv.DictReader(inputcsvfile,delimiter=",")

            for row in reader: 

                latitude = row['latitude']
                longitude = row['longitude']
                year = row['time'][:4]
                deaths = 'NULL'
                affected = 'NULL'
                damage = 'NULL'
                extra = {'magnitude':row['mag'],'place':row['place']}

                writer.writerow({'affected':affected,'end_date':year,'deaths':deaths,'lon':longitude,'damage':damage,'lat':latitude,'start_date':year,'extra':extra})








