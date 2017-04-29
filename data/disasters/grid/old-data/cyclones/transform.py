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

            reader = csv.reader(inputcsvfile,delimiter=",")
            fieldnames = ['affected','end_date','deaths','lon','damage','lat','start_date','extra']
            writer = csv.DictWriter(outputcsvfile, fieldnames=fieldnames)
            writer.writeheader()

            next(reader) #skip first row
            for row in reader: 

                country = row[3]

                try:
                 	coordinates = countries[country]
                except KeyError as e:
                 	pass


                latitude = coordinates['lat']
                longitude = coordinates['lon']

                year = row [6]
                affected = row[16]
                damage = row[17]
                name = row[18]

                writer.writerow({'affected':affected,'end_date':year,'deaths':'NULL','lon':longitude,'damage':damage,'lat':latitude,'start_date':year,'extra':{'name':name}})

                






