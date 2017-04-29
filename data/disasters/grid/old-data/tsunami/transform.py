import os
import csv
import geopy
import click
import time
import urllib


geolocator = geopy.geocoders.GoogleV3()

filename = "tsunamis.csv"
splittedfilename = os.path.splitext(filename)
newfilename = splittedfilename[0] + "-transformed" + splittedfilename[1]
newcache = list()

with open(filename, 'rb') as inputcsvfile:
    reader = csv.DictReader(inputcsvfile, delimiter=",")
    with open("cache.csv", 'rb') as cachefile:
        cache = csv.DictReader(cachefile, delimiter=",")
        cache = list(cache)
        with open(newfilename, 'wb') as outputcsvfile:
            fieldnames = ['affected', 'end_date', 'deaths', 'lon', 'damage', 'lat', 'start_date', 'extra']
            writer = csv.DictWriter(outputcsvfile, fieldnames=fieldnames)
            writer.writeheader()
            with click.progressbar(length=2582) as bar:
                for row in reader:
                    bar.update(1)
                    latitude = row['LATITUDE']
                    longitude = row['LONGITUDE']
                    if latitude == "":
                        try:
                            for cacheline in cache:
                                if cacheline['id'] == row['ID']:
                                    latitude = cacheline['lat']
                                    longitude = cacheline['lon']
                            if latitude == "":
                                print "Googling", row['ID']
                                time.sleep(0.1)
                                location = geolocator.geocode(urllib.quote_plus(row['LOCATION_NAME']), timeout=100000)
                                if location is None:
                                    location = geolocator.geocode(urllib.quote_plus(row['COUNTRY']), timeout=100000)
                                    if location is None:
                                        continue
                                latitude = location.latitude
                                longitude = location.longitude
                                newcache.append({'id': row['ID'], 'lon': longitude, 'lat': latitude})

                        except Exception as e:
                            print(row['LOCATION_NAME'], row['COUNTRY'])
                            continue
                    year = row['YEAR']
                    if float(year) < 1900:
                        continue
                    ##########################################################
                    deaths = row['DEATHS']
                    deaths_description = row['DEATHS_DESCRIPTION']
                    if deaths == "":
                        deaths = 0
                    else:
                        deaths = float(deaths)
                    if deaths_description != "" and deaths_description > 1 and deaths_description < 4:
                        deaths_description = float(deaths_description)
                        deaths = deaths + (10 ** deaths_description)
                    total_deaths = row['TOTAL_DEATHS']
                    total_deaths_description = row['TOTAL_DEATHS_DESCRIPTION']
                    if total_deaths == "":
                        total_deaths = 0
                    else:
                        total_deaths = float(total_deaths)
                    if total_deaths_description != "" and total_deaths_description > 1 and total_deaths_description < 4:
                        total_deaths_description = float(total_deaths_description)
                        total_deaths = total_deaths + (10 ** total_deaths_description)
                    deaths = deaths + total_deaths
                    if deaths == 0:
                        deaths = 'NULL'
                    ##############################################################
                    missing = row['MISSING']
                    missing_description = row['MISSING_DESCRIPTION']
                    if missing == "":
                        missing = 0
                    else:
                        missing = float(missing)
                    if missing_description != "" and missing_description > 1 and missing_description < 4:
                        missing_description = float(missing_description)
                        missing = missing + (10 ** missing_description)
                    total_missing = row['TOTAL_MISSING']
                    total_missing_description = row['TOTAL_MISSING_DESCRIPTION']
                    if total_missing == "":
                        total_missing = 0
                    else:
                        total_missing = float(total_missing)
                    if total_missing_description != "" and total_missing_description > 1 and total_missing_description < 4:
                        total_missing_description = float(total_missing_description)
                        total_missing = total_missing + (10 ** total_missing_description)
                    injuries = row['INJURIES']
                    injuries_description = row['INJURIES_DESCRIPTION']
                    if injuries == "":
                        injuries = 0
                    else:
                        injuries = float(injuries)
                    if injuries_description != "" and injuries_description > 1 and injuries_description < 4:
                        injuries_description = float(injuries_description)
                        injuries = injuries + (10 ** injuries_description)
                    total_injuries = row['TOTAL_INJURIES']
                    total_injuries_description = row['TOTAL_INJURIES_DESCRIPTION']
                    if total_injuries == "":
                        total_injuries = 0
                    else:
                        total_injuries = float(total_injuries)
                    if total_injuries_description != "" and total_injuries_description > 1 and total_injuries_description < 4:
                        total_injuries_description = float(total_injuries_description)
                        total_injuries = total_injuries + (10 ** total_injuries_description)
                    affected = missing + total_missing + injuries + total_injuries
                    if affected == 0:
                        affected = 'NULL'
                    ##############################################################
                    damage = row['DAMAGE_MILLIONS_DOLLARS']
                    damage_description = row['DAMAGE_DESCRIPTION']
                    damage_numbers = {"1": 1, "2": 5, "3": 25, "4": 50}
                    if damage == "":
                        damage = 0
                    else:
                        damage = float(damage)
                    if damage_description != "" and damage_description > 1 and damage_description < 4:
                        damage = damage + damage_numbers.get(damage_description, 0)

                    total_damage = row['TOTAL_DAMAGE_MILLIONS_DOLLARS']
                    total_damage_description = row['TOTAL_DAMAGE_DESCRIPTION']
                    if total_damage == "":
                        total_damage = 0
                    else:
                        total_damage = float(total_damage)
                    if total_damage_description != "" and total_damage_description > 1 and total_damage_description < 4:
                        total_damage = total_damage + damage_numbers.get(total_damage_description, 0)

                    damage = damage + total_damage
                    if damage == 0:
                        damage = 'NULL'
                    else:
                        damage = damage * 1000000

                    extra = {'Location': row['LOCATION_NAME']}

                    writer.writerow({'affected': affected, 'end_date': year, 'deaths': deaths, 'lon': longitude, 'damage': damage, 'lat': latitude, 'start_date': year, 'extra': extra})
with open("cache.csv", 'ab') as cache:
    fieldnames = ['id', 'lon', 'lat']
    writer = csv.DictWriter(outputcsvfile, fieldnames=fieldnames)
    for line in newcache:
        writer.writerow(line)