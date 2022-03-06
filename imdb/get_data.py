from bs4 import BeautifulSoup
import json, os, sys

exists = os.listdir("../screenshots")

movies = []

for i in range(1,11):
    html = ""

    with open(str(i)+".html", "r") as f:
        html = f.read()

    
    soup = BeautifulSoup(html, 'html.parser')

    for item in soup.find_all('h3', {'class' : 'lister-item-header'}):
        for a in item.find_all("a"):
            href = a["href"].split("/")[2]
            title = a.get_text()
            screenshot_status = "true" if href in exists else "false"
            movies.append([href, title, screenshot_status])

f = open("movies.json", "w") 
f.write(json.dumps(movies))
f.close()
