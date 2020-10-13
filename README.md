# GalleryFronted

Simple gallery app with NestJs and angular in [Fronted](https://github.com/gary94746/gallery-angular)

This app contains:
- Data Validation
- Image resizing with sharp
- Image download, upload
- Files manipulation
- Config module, async injection
- Postgres

To run this app local, make sure that you have the .env configured correctly
``` bash
yarn install
yarn start
```

This app is also avalaible with docker
```bash
# first build the docker image
docker build -t gallery-backend .
# run the build image
docker run --name gallery-backend -d -p 3000:3000 gallery-backend
```

This project was hosted on heroku
