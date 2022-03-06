import sys, os

if len(sys.argv) != 3:
    print("Usage: generate_screenshots.py imdb_id movie_file")
    sys.exit(1)

imdb_id = sys.argv[1]
output_dir = "screenshots/{}".format(imdb_id)

movie_file = sys.argv[2]

if not os.path.isdir(output_dir):
    os.mkdir("screenshots/{}".format(imdb_id))

for i, time in enumerate(range(10, 90, 5)): # 10 -> 85
    time_percent = str(time) + "%"

    output = "screenshots/{}/{}.png".format(imdb_id, i)

    command = 'ffmpegthumbnailer -i "{}" -o "{}" -s 512 -t "{}"'.format(movie_file, output, time_percent)

    os.system(command)
