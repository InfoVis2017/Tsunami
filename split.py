import sys

def main(argv)
    ctr = 0
    f = open(argv[0], "r")
    o = open(argv[1] + str(ctr), "w")
    
    ctrLine = 0
    for line in f:
        ctrLine += 1
        o.writelines([line])
        if(ctrLine == 2000):
            o.close()
            ctr += 1
            o = open(argv[1] + str(ctr), "w")
            ctrLine = 0

if __name__ == "__main__":
    main(sys.argv[1:])
