require('dotenv').config()

const express = require('express')
const hbs = require('hbs')

// require spotify-web-api-node package here:
const SpotifyWebApi = require('spotify-web-api-node')

const app = express()

app.set('view engine', 'hbs')
app.set('views', __dirname + '/views')
app.use(express.static(__dirname + '/public'))

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
})

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body['access_token']))
  .catch((error) =>
    console.log('Something went wrong when retrieving an access token', error)
  )

// Our routes go here:
app.get('/', (request, response, next) => {
  response.render('home')
})

app.get('/artist-search', (request, response, next) => {
  const { artist } = request.query

  spotifyApi
    .searchArtists(artist)
    .then((data) => {
      console.log('Artists', data.body.artists)
      const artists = data.body.artists.items.map((art) => {
        return {
          id: art.id,
          name: art.name,
          imageUrl: art.images[0] ? art.images[0].url : null,
        }
      })
      response.render('artist-search-results', { artists })
    })
    .catch((err) =>
      console.log('The error while searching artists occurred: ', err)
    )
})

app.get('/albums/:artistId', (request, response, next) => {
  const artistId = request.params.artistId

  spotifyApi
    .getArtist(artistId)
    .then((data) => {
      //console.log('Artist', data.body.name)
      const artistName = data.body.name
      spotifyApi
        .getArtistAlbums(artistId)
        .then((data) => {
          //console.log('Artist albums', data.body.items)
          const albums = data.body.items.map((alb) => {
            return {
              id: alb.id,
              name: alb.name,
              imageUrl: alb.images[0] ? alb.images[0].url : null,
            }
          })
          response.render('albums', { artistName, albums })
        })
        .catch((err) =>
          console.log('The error while searching albums occurred: ', err)
        )
    })
    .catch((err) =>
      console.log('The error while searching the artist occurred: ', err)
    )
})

app.get('/album/:albumId', (request, response, next) => {
  const albumId = request.params.albumId

  spotifyApi
    .getAlbum(albumId)
    .then((data) => {
      console.log('Album', data.body)
      const albumName = data.body.name
      const artistsName = data.body.artists

      spotifyApi
        .getAlbumTracks(albumId)
        .then((data) => {
          //console.log('Tracks', data.body.items)
          const tracks = data.body.items.map((trk) => {
            return {
              id: trk.id,
              name: trk.name,
              previewUrl: trk.preview_url ? trk.preview_url : null,
            }
          })
          response.render('album', { albumName, artistsName, tracks })
        })
        .catch((err) =>
          console.log('The error while searching the tracks occurred: ', err)
        )
    })
    .catch((err) =>
      console.log('The error while searching the album occurred: ', err)
    )
})

app.listen(3000, () =>
  console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊')
)
