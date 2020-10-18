import json
import csv

# This python script is not part of the module.
# It was used to extract an initial list of images used by the SRD.
# That list was then curated to remove duplicates and resolve conflicts.
# In some cases alternate images were selected from what was used in the SRD.

base_dict = {}
output = []

with open("E:\Games\Foundry\UserData\Data\systems\dnd5e\packs\monsters.db") as f:
    line = f.readline()

    while line:
        monster = json.loads(line)
        items = monster["items"]
        for item in items:
            row = [monster["name"], item["name"], item["img"]]
            output.append(row)

        line = f.readline()

with open('output.csv', 'wb') as of:
    writer = csv.writer(of)
    writer.writerows(output)
