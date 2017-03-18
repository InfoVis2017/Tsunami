import csv
import time
import geopy
import click
import getopt
import sys

# setup a geocoder, such as OpenStreet Nominatim or Google V3
# used for converting city names into (long,lat) coordinates
# caveat: API usage per day is limited (problematic for larger datasets...)

geolocator = geopy.geocoders.GoogleV3()         # very decent, but limited to 2500 requests/day
#geolocator = geopy.geocoders.Nominatim()       # similar results to GoogleV3
#geolocator = geopy.geocoders.ArcGIS()          # slows down after multiple requests...

def geocode(nam):
    geolocator.geocode(nam,timeout=3)

# A simple function to transform CSV data into a 'standard' format
#   - input should be the input .csv file
#   - output is the location that the output file should be written to
#   - transfomer is a dictionary mapping keys to lambdas for computing that property
def transform_csv(input,output,transformer,initialize=None):
    total = 0
    invalid = 0
    startT = time.time()
    fieldnames = transformer.keys()
    with open(input,'rb') as inputfile:
        with open(output,'wb') as outputfile:
            reader = csv.DictReader(inputfile)
            writer = csv.DictWriter(outputfile,fieldnames)
            writer.writeheader()
            # geocoding can take some time
            # hence it is useful to include a progressbar to the iteration
            with click.progressbar(reader,
                                   label="Transforming CSV data",
                                   length=sum(1 for line in open(input))) as records:
                for record in records:
                    try:
                        if(initialize):
                            initialize(record)
                        entry = { k: f(record) for (k,f) in transformer.iteritems() }
                        writer.writerow(entry)
                    except geopy.exc.GeopyError:    # geocoding errors cannot be tolerated => abort transformation
                        raise
                    except:                         # other errors can be caused by some invalid records => continue
                        invalid = invalid + 1
                    total = total + 1
            endT = time.time()
            print('Processed ' + str(total-invalid) + '/' + str(total) + ' records')
            print('Duration: ' + str(endT-startT) + 's')
            print('Output written to ' + output)

##
## EMDAT uses the same format in CSV files
##

def find_location(flood):
    # To locate a flood, try the following in this order
    #  - locate the province (omit everything after first comma, see data in csv file)
    #  - locate the country (maybe this is way too coarse grained... better just skip?)
    #  TODO: maybe try other locator services next to GoogleV3?)
    province_loc = flood['location'].split(',')[0]
    country_loc = flood['country_name']
    return geocode(province_loc) or geocode(country_loc)

def transform_emdat_csv(input,output):
    transform_csv(input=input,
                  output=output,
                  initialize=(lambda d: d.update({'coords':find_location(d)})),
                  transformer={'start_date': lambda d: d['start_date'],
                               'end_date': lambda d: d['end_date'],
                               'deaths': lambda d: d['total_deaths'],
                               'lon': lambda d: d['coords'].longitude,
                               'lat': lambda d: d['coords'].latitude})

##
## EXAMPLE: transforming epedimic.csv data
##

#transform_emdat_csv(input="_old_/data/disasters/emdat/epidemic.csv",
#                    output="_old_/data/disasters/emdat/epidemic_new.csv")

##
## For command line people
##

def showUsage():
    print 'Correct usage:'
    print 'python csv_convert.py -i <inputfile> -o <outputfile> -f <format>'
    sys.exit(2)

def main(argv):
    transformer = None
    inputfile = None
    outputfile = None
    try:
      opts, args = getopt.getopt(argv,"hi:o:f:",["in=","out=","format="])
    except getopt.GetoptError:
        showUsage()
    for opt, arg in opts:
        if opt in ("-i", "--in"):
            inputfile = arg
        elif opt in ("-o", "--out"):
            outputfile = arg
        elif opt in ("-f", "--format"):
            if(arg == "emdat"):
                transformer = transform_emdat_csv
            else:
                print("Format not supported")
                sys.exit(2)
    if(None in (transformer,inputfile,outputfile)):
        showUsage()
    else:
        transformer(input=inputfile,output=outputfile)

if __name__ == "__main__":
    main(sys.argv[1:])
