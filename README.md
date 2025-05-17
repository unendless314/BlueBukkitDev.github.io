# Galactic Center Tracker & Associative Remote Viewing

This repository contains a lightweight static site with two main pages:

1. **Galactic Center Tracker** (`index.html`)
2. **Associative Remote Viewing** (`arv.html`)

Both pages can be served locally using Python's HTTP server:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in a browser.

## Features

### Galactic Center Tracker
- Calculates the Local Sidereal Time (LST) for a user defined latitude and longitude.
- Determines the altitude and azimuth of the galactic center in real time.
- Displays the results with a colorized indicator of the remote viewing effect at the current LST.
- Allows updating the location manually or by using your device's GPS.
- Provides a link to the ARV interface.

### Associative Remote Viewing
- Loads a pool of target images defined in `images/arv/list.json`.
- Allows filtering images by tags (e.g., `manmade`, `natural`).
- Randomly selects a specified number of images to display.
- Lets the viewer choose an image, revealing its index while blurring the rest.

## File Structure
```
.
├── index.html          # Galactic Center Tracker interface
├── index.js            # LST and galactic center calculations
├── styles.css          # styles for the tracker
├── arv.html            # Associative Remote Viewing interface
├── arv.js              # ARV logic and image loading
├── arv.css             # styles for the ARV page
├── images
│   ├── RV Effect_binary.png           # image used by index.js
│   └── arv
│       ├── list.json                 # list of available target images
│       └── *.png                     # individual ARV images
```

## Extending `images/arv/list.json`
To add new target images:
1. Place your PNG file in the `images/arv/` folder.
2. Edit `images/arv/list.json` and append an entry:

```json
{ "filename": "your-image.png", "tags": ["manmade"] }
```

You may provide multiple tags to help with filtering. After updating the JSON file and restarting the server, the new images will be available through the ARV interface.
