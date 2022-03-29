import json, os, csv

j = []

with open("movies.json", "r") as f:
    j = json.loads(f.read())

exists = os.listdir("../screenshots")

filtered = []

newish = []
with open('movies_metadata.csv', mode ='r') as f:
   
  # reading the CSV file
  csvFile = csv.DictReader(f)
 
  # displaying the contents of the CSV file
  for lines in csvFile:
      if (lines["release_date"] == None or not lines["release_date"].startswith("20")):
          continue
      newish.append(lines["imdb_id"])

print(newish)

for m in j:
    if m[0] not in newish:
        filtered.append([m[0], m[1], "false"])
    else:
        filtered.append([m[0], m[1], "true" if m[0] in exists else "false"])


with open("../movies.json", "w") as f:
    f.write(json.dumps(filtered))
