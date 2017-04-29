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

                country = row['iso3,C,3']

                try:
                 	coordinates = countries[country]
                except KeyError as e:
                 	pass


                latitude = coordinates['lat']
                longitude = coordinates['lon']

                year = row ['year,N,10,0']

                deaths = 'NULL'
                affected = 'NULL'
                damage = 'NULL'
                extra = 'NULL'

                writer.writerow({'affected':affected,'end_date':year,'deaths':deaths,'lon':longitude,'damage':damage,'lat':latitude,'start_date':year,'extra':extra})

                






