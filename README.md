# Aria2 Control TUI

A lightweight terminal UI and systemd service manager for [aria2](https://aria2.github.io/), with support for controlling downloads through aria2's JSON-RPC interface.

The project consists of two parts:

* **Aria2 Control TUI** — a terminal-based interface for managing downloads.
* **aria2-chrome extension** — sends browser downloads to the local aria2 RPC service.

The aria2 daemon runs as a **systemd user service**, so it runs under your own user account without requiring root privileges.

## Features

* Terminal-based download manager
* Add downloads directly from the TUI
* Pause, resume, restart, and remove downloads
* Pause or resume all downloads
* Real-time download progress and speed
* aria2 JSON-RPC integration
* Runs as a systemd user service
* Automatically starts with your user session
* Persistent aria2 download session
* Downloads are stored in `~/Downloads` by default
* Works with the aria2 browser extension

## Requirements

The following commands must be available:

* `aria2c`
* `curl`
* `jq`
* `tput`

On Arch-based distributions, for example:

```bash
sudo pacman -S aria2 curl jq ncurses
```

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Make the script executable

```bash
chmod +x aria2-control
```

### 3. Install and start the aria2 service

```bash
./aria2-control install
```

This creates:

```text
~/.config/systemd/user/aria2.service
~/.aria2/aria2.conf
~/.aria2/aria2.session
```

The service is enabled and started automatically.

The default download directory is:

```text
~/Downloads
```

### 4. Verify the service

```bash
./aria2-control status
```

You can also check it directly through systemd:

```bash
systemctl --user status aria2.service
```

## Browser Integration

The repository includes the `aria2-chrome` browser extension for sending downloads from Chromium-based browsers to aria2.

The extension is loaded as an **unpacked extension** using Chrome/Chromium's Developer Mode.

### Load aria2-chrome in Chrome/Chromium

1. Open Chrome or Chromium.

2. Navigate to:

```text
chrome://extensions
```

3. Enable **Developer mode** using the toggle in the top-right corner.

4. Click **Load unpacked**.

5. Select the **directory containing the extension's `manifest.json`**.

For example, if the repository looks like this:

```text
aria2-control/
├── aria2-control
├── README.md
└── aria2-chrome/
    ├── manifest.json
    ├── background.js
    ├── ...
```

select:

```text
aria2-control/aria2-chrome/
```

**Do not select the repository's parent directory unless that directory itself contains `manifest.json`.**

Chrome will then add the extension to the extensions page. You can optionally pin it to the toolbar from the Extensions menu.

Chrome officially supports loading local/unpacked extensions this way through Developer Mode.

### Using the extension

Once the extension is loaded and the aria2 service is running:

1. Open a webpage containing a downloadable file.
2. Right-click the download link.
3. Select:

```text
Download with aria2c
```

The extension sends the download request to aria2 through its local JSON-RPC service.

The download will then appear in the TUI:

```bash
./aria2-control
```

### If the extension doesn't appear

Open:

```text
chrome://extensions
```

and check that:

* **Developer mode** is enabled.
* `aria2-chrome` is listed.
* The extension is enabled.
* The selected directory contains `manifest.json`.
* There are no errors shown under the extension.

Chrome also provides a **Reload** button for unpacked extensions, which is useful after modifying the extension's source files.

> **Security note:** Only load unpacked extensions from source code you trust. Chrome specifically recommends unpacked extensions for development and trusted local code.

## Usage

Start the TUI:

```bash
./aria2-control
```

or simply:

```bash
aria2-control
```

if the script is available in your `$PATH`.

### Keyboard shortcuts

| Key       | Action                                  |
| --------- | --------------------------------------- |
| `a`       | Add download URL                        |
| `p`       | Pause selected download                 |
| `r`       | Resume selected download                |
| `R`       | Restart selected download               |
| `d` / `x` | Remove selected download                |
| `c`       | Clear completed/failed download results |
| `P`       | Pause all downloads                     |
| `U`       | Resume all downloads                    |
| `↑` / `↓` | Navigate downloads                      |
| `j` / `k` | Navigate downloads                      |
| `h`       | Show keybindings                        |
| `q`       | Quit TUI                                |

## Service Management

aria2 runs as a **systemd user service**.

### Start

```bash
./aria2-control start
```

### Stop

```bash
./aria2-control stop
```

### Restart

```bash
./aria2-control restart
```

### Check status

```bash
./aria2-control status
```

The service is enabled during installation, so it will automatically start with your user session.

You can also manage it directly with systemd:

```bash
systemctl --user start aria2.service
systemctl --user stop aria2.service
systemctl --user restart aria2.service
systemctl --user status aria2.service
```

## Persistent Downloads

The aria2 configuration uses a persistent session file:

```text
~/.aria2/aria2.session
```

aria2 periodically saves its download session and reloads it when the daemon starts again.

This means interrupted downloads can survive:

* system restarts
* user session restarts
* aria2 service restarts
* aria2 crashes followed by service restart

aria2 provides `--save-session` and `--input-file` specifically for saving and restoring download sessions.

Partially downloaded files are also configured to continue downloading rather than starting over.

## Configuration

The generated aria2 configuration is located at:

```text
~/.aria2/aria2.conf
```

The default download directory is:

```text
~/Downloads
```

The JSON-RPC service listens locally on:

```text
http://localhost:6800
```

The RPC server is configured to listen only on the local machine rather than exposing the service to the network.

aria2's RPC interface uses port `6800` by default when configured accordingly.

## Files and Directories

After installation, the main files are:

```text
~/.config/systemd/user/
└── aria2.service

~/.aria2/
├── aria2.conf
└── aria2.session

~/Downloads/
└── downloaded files
```

The aria2 log is stored at:

```text
~/aria2.log
```

## Troubleshooting

### TUI cannot connect to aria2

Check whether the service is running:

```bash
./aria2-control status
```

If necessary:

```bash
./aria2-control restart
```

You can also check whether aria2 is listening on port `6800`:

```bash
ss -ltn | grep ':6800'
```

### Chrome says the extension has errors

Go to:

```text
chrome://extensions
```

Find `aria2-chrome` and inspect the error message shown under the extension.

After modifying extension files, click **Reload** from the extension's card.

### Downloads are not appearing in the TUI

First verify that aria2 is running:

```bash
./aria2-control status
```

Then verify that the RPC endpoint is available:

```bash
curl -s http://localhost:6800/jsonrpc
```

The browser extension and TUI both communicate with the same local aria2 RPC service.

### Download stops after reboot

Check that the session file exists:

```bash
ls -lh ~/.aria2/aria2.session
```

Then verify that the aria2 configuration contains the session settings:

```bash
grep -E '^(input-file|save-session|save-session-interval|force-save)=' ~/.aria2/aria2.conf
```

## License

See the `LICENSE` file for licensing information.
