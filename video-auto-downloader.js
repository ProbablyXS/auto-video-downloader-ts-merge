// ==UserScript==
// @name         Video Auto Loader & Downloader (XHR Intercept)
// @namespace    https://beerscloud.com/
// @version      1.0
// @description  Wait for the .ts link to be generated via XHR, retrieve the segments, and merge them into an .mp4 file
// @author       ChatGPT
// @match        *://beerscloud.com/iframe/*
// @match        *://sharecloudy.com/iframe/*
// @match        https://github.com/*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @run-at       document-end
// ==/UserScript==

var TargetLink = $("a:contains('cars')");

if (TargetLink.length)
    GM_openInTab (TargetLink[0].href);

(function () {
    // URL du fichier version.json sur GitHub
    const versionUrl = "https://raw.githubusercontent.com/ProbablyXS/auto-video-downloader-ts-merge/main/version.json";

    // Fonction pour vérifier si une mise à jour est disponible
    async function checkForUpdates() {
        try {
            let response = await fetch(versionUrl);
            if (response.ok) {
                let data = await response.json();
                const remoteVersion = data.version;
                const updateUrl = data.url;

                // Vérifie si la version distante est plus récente
                if (remoteVersion !== localVersion) {
                    notifyUserOfUpdate(remoteVersion, updateUrl);
                }
            }
        } catch (error) {
            console.error('Erreur lors de la vérification des mises à jour:', error);
        }
    }

    // Fonction pour afficher une notification à l'utilisateur
    function notifyUserOfUpdate(remoteVersion, updateUrl) {
        GM_notification({
            title: "Nouvelle mise à jour disponible!",
            text: `Une nouvelle version (${remoteVersion}) est disponible pour ce script. Cliquez ici pour voir les détails.`,
            highlight: true,
            onclick: function () {
                window.open(updateUrl, '_blank');
            }
        });
    }

    // Vérifie les mises à jour au démarrage du script
    checkForUpdates();

    'use strict';

    let tsLink = null;  // To store the .ts file link
    let tsLinks = new Set();  // To store the .ts video segments
    let isTsLinkAvailable = false; // Flag to check if the .ts link is detected
    let foundSegments = 0;  // Counter for the found segments
    let downloadedSegments = 0;  // Counter for the downloaded segments
    let startTime = 0;  // Start time for the download
    let statusBox = null;  // Status box for tracking information
    let timeRemainingText = null;  // Display for the remaining time

    // Ajouter le bouton de téléchargement du fichier JS depuis GitHub
    function createDownloadButtonForGitHub() {
        let button = document.createElement("button");
        button.textContent = "Télécharger le fichier JS";
        button.style.position = "fixed";
        button.style.top = "20px";
        button.style.right = "20px";
        button.style.zIndex = "9999";
        button.style.padding = "10px 20px";
        button.style.backgroundColor = "#007bff";
        button.style.color = "#fff";
        button.style.border = "none";
        button.style.borderRadius = "5px";
        button.style.cursor = "pointer";
        button.addEventListener("click", function () {
            // Téléchargement du fichier JS depuis GitHub
            const jsFileUrl = "https://raw.githubusercontent.com/ProbablyXS/auto-video-downloader-ts-merge/main/script.js"; // Remplacez par le lien de votre fichier JS sur GitHub
            GM_download({
                url: jsFileUrl,
                name: "script.js",
                saveAs: true
            });
            button.remove(); // Supprimer le bouton après avoir cliqué
        });
        document.body.appendChild(button);
    }

    // Show the status box
    function showStatusBox() {
        if (!statusBox) {
            statusBox = document.createElement("div");
            statusBox.style.position = "fixed";
            statusBox.style.top = "60px";
            statusBox.style.left = "20px";
            statusBox.style.zIndex = "9999";
            statusBox.style.padding = "10px";
            statusBox.style.backgroundColor = "black";
            statusBox.style.color = "white";
            statusBox.style.fontSize = "20px";  // Enlarged font size
            statusBox.style.borderRadius = "5px";
            document.body.appendChild(statusBox);
        }
        updateStatusBox(); // Update the status
    }

    // Display the remaining time in minutes
    function updateTimeRemaining() {
        if (!timeRemainingText) {
            timeRemainingText = document.createElement("div");
            timeRemainingText.style.position = "fixed";
            timeRemainingText.style.top = "110px";
            timeRemainingText.style.left = "20px";
            timeRemainingText.style.zIndex = "9999";
            timeRemainingText.style.padding = "10px";
            timeRemainingText.style.backgroundColor = "black";
            timeRemainingText.style.color = "white";
            timeRemainingText.style.fontSize = "16px";  // Font size
            timeRemainingText.style.borderRadius = "5px";
            document.body.appendChild(timeRemainingText);
        }

        const elapsedTime = (Date.now() - startTime) / 1000; // Elapsed time in seconds
        const remainingSegments = foundSegments - downloadedSegments; // Remaining segments
        const downloadSpeed = downloadedSegments / elapsedTime; // Download speed in segments per second

        if (downloadSpeed > 0) {
            const estimatedTimeRemaining = (remainingSegments / downloadSpeed / 60).toFixed(2); // Estimate of remaining time in minutes
            timeRemainingText.textContent = `Estimated remaining time: ${estimatedTimeRemaining} minutes`;
        } else {
            timeRemainingText.textContent = `Calculating remaining time...`;
        }
    }

    // Update the status box content
    function updateStatusBox() {
        statusBox.textContent = `Segments found: ${foundSegments} | Downloaded: ${downloadedSegments}`;
        updateTimeRemaining(); // Update the remaining time
    }

    // Intercept all XHR requests
    (function interceptXHR() {
        const originalSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function (...args) {
            this.addEventListener('load', function () {
                if (this.responseURL && this.responseURL.endsWith('.ts')) {
                    tsLink = this.responseURL; // Capture the .ts link
                    isTsLinkAvailable = true;
                }
            });
            originalSend.apply(this, args);
        };
    })();

    // Fonction pour vérifier la validité d'un segment .ts
    async function checkTSUrl(url) {
        try {
            let response = await fetch(url, { method: "HEAD" });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // Fonction pour télécharger et fusionner les segments .ts
    async function downloadAndMergeTS() {
        if (!tsLink) {
            alert("❌ No .ts link found!");
            return;
        }

        let maxConcurrentDownloads = 10;
        let activeDownloads = 0;
        let mergedBlobParts = [];  // List to store the segment data

        let tsUrlBase = tsLink.replace(/(\d+)\.ts$/, '');  // Extract the base URL of the .ts link
        let i = 1;
        let segmentUrl;
        let isValid = true;

        // Start the timer
        startTime = Date.now();

        while (isValid) {
            segmentUrl = `${tsUrlBase}${i}.ts`;  // Generate the URL with the index
            isValid = await checkTSUrl(segmentUrl);  // Check if the segment is valid

            if (isValid) {
                tsLinks.add(segmentUrl);  // Add to the list of segments to download
                foundSegments++;  // Increment the found segments counter
                updateStatusBox();  // Update the status display
                i++;
            } else {
                break;  // Stop when an invalid segment is encountered
            }
        }

        if (tsLinks.size === 0) return;

        // Function to download a segment
        const downloadSegment = (tsUrl) => {
            activeDownloads++;
            GM_xmlhttpRequest({
                method: "GET",
                url: tsUrl,
                responseType: "arraybuffer",
                onload: (response) => {
                    if (response.status === 200) {
                        mergedBlobParts.push(response.response);  // Add the segment to the Blob
                        downloadedSegments++;  // Increment the downloaded segments counter
                        updateStatusBox();  // Update the status display
                    }
                    activeDownloads--;
                    processQueue();  // Check if more downloads can start
                },
                onerror: () => {
                    activeDownloads--;
                    processQueue();  // Check if more downloads can start
                }
            });
        };

        // Function to manage the download queue
        const processQueue = () => {
            if (activeDownloads < maxConcurrentDownloads && tsLinks.size > 0) {
                const tsUrl = tsLinks.values().next().value;  // Get the next .ts link
                tsLinks.delete(tsUrl);  // Remove the segment from the list
                downloadSegment(tsUrl);  // Start downloading the segment
            }
        };

        processQueue();  // Start downloading the segments

        // Wait for all downloads to finish
        while (activeDownloads > 0) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Merge the downloaded segments into a single MP4 file
        let finalBlob = new Blob(mergedBlobParts, { type: "video/mp4" });
        let finalUrl = URL.createObjectURL(finalBlob);

        let a = document.createElement("a");
        a.href = finalUrl;
        a.download = "video_merged.mp4";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        alert("📂 Download complete!");
    }

    // Continuously check the availability of the .ts link
    function checkTsLinkAvailability() {
        foundSegments = 0;  // Reset the counters
        downloadedSegments = 0;
        updateStatusBox();  // Update the status display
        if (isTsLinkAvailable) {
            downloadAndMergeTS();  // Start the download if the .ts link is available
        } else {
            setTimeout(checkTsLinkAvailability, 2000); // Check every 2 seconds
        }
    }

    // Create the download button for GitHub
    createDownloadButtonForGitHub();

    // Create the download button for video
    createDownloadButton();

})();
