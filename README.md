# Video Auto Loader & Downloader

A userscript that intercepts XHR requests to automatically download and merge video segments (.ts files) into a single .mp4 file for seamless offline viewing.

## Description

This userscript is designed to help users download videos from websites that stream content in `.ts` (MPEG Transport Stream) format. It works by intercepting XHR (XMLHttpRequest) requests and detecting the `.ts` segments as they are loaded. The script then automatically downloads the video segments, merges them into a single `.mp4` file, and provides an option to download the final video.

## Features

- **Auto detection of `.ts` video segments**: The script listens for XHR requests to identify `.ts` file segments.
- **Automatic download and merge**: Once the segments are detected, they are automatically downloaded and merged into a single `.mp4` file.
- **Progress tracking**: A status box is displayed, showing the number of segments found and downloaded, along with the estimated time remaining.
- **Custom download button**: A button is added to the page, allowing you to start the download process manually.
- **GitHub update notification**: The script checks for updates on GitHub and notifies the user when a new version is available.

## Installation

To use this script, you need a userscript manager. Two popular options are:

- [Tampermonkey](https://www.tampermonkey.net/)
- [Greasemonkey](https://www.greasespot.net/)

### Steps to install:

1. **Install Tampermonkey or Greasemonkey** in your browser.
2. **Create a new script** and paste the entire script into the editor.
3. **Save the script**. It should now be active on the supported websites.

## How to Use

1. Once the script is installed, navigate to a supported website (e.g., `beerscloud.com` or `sharecloudy.com`).
2. When you start playing a video, the script will automatically detect `.ts` segments as they load.
3. A "Start Download" button will appear in the top-left corner of the screen. Click it to begin the download process.
4. The script will download and merge the segments, showing progress in a status box.
5. Once all segments are downloaded, a download link for the final `.mp4` file will appear.

## Configuration

You can adjust the following values in the script to suit your needs:

- **Max concurrent downloads**: Controls the number of video segments downloaded simultaneously. Modify the `maxConcurrentDownloads` variable if you need to adjust this.
- **Update check interval**: The script checks for updates on GitHub by default every 2 seconds. This is controlled by the `checkTsLinkAvailability` function.

## Updates

The script will check for updates on GitHub. When a new version is available, the script will notify you via a browser notification with a link to the release page.

## Known Issues

- The script may not work if the website uses custom encryption or other techniques to protect video streams.
- In some cases, if the video is served from multiple servers, the script may not detect all segments.

## Contributing

Feel free to fork the repository and submit pull requests if you'd like to contribute. If you find bugs or have feature requests, open an issue on the GitHub repository.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This script is intended for educational purposes only. It should only be used to download content from websites where you have permission to do so. Please respect the copyright and terms of service of the websites you visit.

---

### Links

[- **GitHub Repository**: [[[https://github.com/your-username/video-auto-loader-downloader](https://github.com/your-username/video-auto-loader-downloader](https://github.com/ProbablyXS/auto-video-downloader-ts-merge](https://github.com/ProbablyXS/auto-video-downloader-ts-merge/tree/main?tab=readme-ov-file)))](https://github.com/ProbablyXS/auto-video-downloader-ts-merge/tree/main?tab=readme-ov-file)
- **Tampermonkey**: [https://www.tampermonkey.net/](https://www.tampermonkey.net/)
- **Greasemonkey**: [https://www.greasespot.net/](https://www.greasespot.net/)
