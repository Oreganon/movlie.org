import json, os

j = []

with open("movies.json", "r") as f:
    j = json.loads(f.read())

exists = os.listdir("../screenshots")

filtered = []

for m in j:
    filtered.append([m[0], m[1], "true" if m[0] in exists else "false"])


with open("../movies.json", "w") as f:
    f.write(json.dumps(filtered))
