### Sensor Jupitor

Sensor Jupitor uses SensorAtlas as its main dependency.

For the frontend, we are using Vue3, Nuxt3, and Vuetify3.

There are currently some issues with the frontend.

### Docker instructions.

Pretty straightforward.

Simply run `docker compose build` and then `docker compose up`.

All the settings are housed in the Dockerfile and docker-compose.yml files. 

There is also a dockerfile in the sa-frontend folder.

### Migrations

FOr database migrations, run the following:

`docker compose exec sa-backend python manage.py makemigrations sensorAtlas`

`docker compose exec sa-backend python manage.py migrate`

### Notes

You may need to run the following within the sa-frontend docker container due to a VITE error:


```
npm upgrade @nuxt/ui-templates
```

Note that you will need to compose back down and up after running this command.

Link: https://github.com/nuxt/nuxt/issues/22383#issuecomment-1656540496
