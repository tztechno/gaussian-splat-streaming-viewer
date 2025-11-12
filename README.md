# Gaussian Splat Streaming Viewer

I'd be happy to translate that into English\!

# Gaussian Splat Streaming Viewer

A driver's-eye Gaussian Splatting viewer that automatically streams and loads large-scale scenes.

## ✨ Features

  - 🚗 **Auto Mode**: Automatic driving at a set speed
  - 🎮 **Free Mode**: Free exploration using keyboard and mouse
  - 📦 **Automatic Streaming**: Loads only the necessary segments based on location
  - 🔄 **Memory Optimization**: Automatically unloads unneeded segments
  - ⚡ **Fast Loading**: Smooth experience with a preloading feature

## 🎮 How to Use

### Auto Mode

  - **Play/Stop**: Start and stop automatic driving
  - **Speed Adjustment**: Change the movement speed with a slider
  - **Segment Jump**: Instantly move to any section

### Free Mode

  - **W/A/S/D**: Move forward, back, left, and right
  - **Q/E**: Move up and down
  - **Shift**: Fast movement
  - **Mouse**: Free rotation of the viewpoint
  - **Click**: Mouse lock (Press ESC to unlock)

-----

## 🚀 Setup

### Requirements

  - Node.js 16.x or higher
  - npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/gaussian-splat-streaming-viewer.git
cd gaussian-splat-streaming-viewer

# Install dependencies
npm install

# Generate dummy Splat files
npm run generate-splats

# Start the development server
npm run dev
```

The browser will automatically open `http://localhost:3000`.

-----

## 📁 Project Structure

```
gaussian-splat-streaming/
├── src/
│   ├── main.jsx                    # Entry point
│   ├── App.jsx                     # Main application
│   ├── components/
│   │   ├── SplatViewer.jsx         # 3D Viewer
│   │   └── ControlPanel.jsx        # Control UI
│   ├── utils/
│   │   ├── GaussianSplatLoader.js  # Splat file loader
│   │   └── generateDummySplat.js   # Dummy data generation
│   └── data/
│       └── segments.json           # Segment configuration
└── public/
    └── splats/                     # Splat file storage
```

-----

## 🔧 Replacing with Real Dashcam Footage

### 1\. Prepare Splat Files

Place the Splat files generated from your dashcam footage into `public/splats/`:

```bash
cp /path/to/your/*.splat public/splats/
```

### 2\. Update segments.json

Edit `src/data/segments.json` to match your actual data:

```json
{
  "segments": [
    {
      "id": 0,
      "start": 0,
      "end": 10,
      "file": "dashcam_00-10.splat",
      "name": "0-10 seconds",
      "timestamp": "00:00:00-00:00:10"
    }
  ]
}
```

-----

## 📦 Build

```bash
# Production build
npm run build

# Preview the build
npm run preview
```

-----

## 🛠️ Tech Stack

  - **React** 18.x
  - **Three.js** 0.160.x
  - **@react-three/fiber** - Three.js renderer for React
  - **@react-three/drei** - Three.js helpers
  - **Vite** - Fast build tool

-----

## 📝 File Format

### .splat Format (Binary)

Each splat: 32 bytes

  - position: float32 x 3 (12 bytes)
  - scale: float32 x 3 (12 bytes)
  - color: uint8 x 4 (4 bytes - RGBA)
  - rotation: int8 x 4 (4 bytes - quaternion)

-----

## 🤝 Contributions

Pull requests are welcome\! For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

MIT

## 👤 Author

stpeteishii - [@IshiiStpete](https://twitter.com/@IshiiStpete)

## 🙏 Acknowledgements

  - For the Gaussian Splatting technique
  - The Three.js community
  - The React Three Fiber team
  - 
