---
title: Add a video to a slate
description: Paste a YouTube, Vimeo or Loom link onto a slate and get a video note with its title and picture. It plays in place when you press play, and plays inside a presentation too.
---

# Add a video to a slate

Paste a YouTube, Vimeo or Loom link onto a slate to get a video note: the video's picture, its title, who made it, and a play button. Press play and the video plays right on the note. Nothing plays on its own.

## Add a video note

1. Copy a video's address from YouTube, Vimeo or Loom.
2. Click the slate where you want it, then paste. You can also drop a link onto the slate.
3. The note appears with the video's picture, title and author, for everyone on the slate. It saves like any other note, and **Undo** takes it back.

If the video host shares no title or picture, the note still appears with its play button, and a message says what was missing.

## Play it

- Press the play button on the note, or select the note and press **Enter**. The video plays over the note's picture.
- Press **Escape** or the close button to stop it and show the picture again.
- Playing is yours alone: it does not start the video for anyone else on the slate.
- People who can only view the slate press anywhere on the note to play it.

Before you press play, your browser asks nothing of the video host. The note's picture is stored by Slatebox when the video is added. The player is each host's privacy-respecting player, kept apart from the slate's page.

## In a presentation

A video note plays inside the slide when you press play while presenting. Going to the next step stops it.

## Everywhere else, its picture

Every other place a slate is shown uses the same picture of the note, with its play button and title, and never plays:

- the slate's card on **My slates**, in the gallery and on a team's page
- the presenter's overview of the slides
- a slate exported as a PNG picture

## Limits

| Limit | Value |
| --- | --- |
| Video hosts | YouTube, Vimeo and Loom |
| New videos added | 60 an hour per person. A video someone already added does not count. |
| Autoplay | Never |

## Add a video from an agent or a script

Agents and scripts add the same note with one call: `slates.addMedia` in an exec script, `POST /api/v1/slates/{shareId}/media`, or the MCP tool `add_media_note` on Slatebox's hosted MCP server. `media.lookup` reads a video's title and picture without adding a note. [Agents on the canvas: the API](../Developers/SlateboxAPI/agents-on-the-canvas.md)

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Pasting a link did not add a video | The link is not from YouTube, Vimeo or Loom. Use the video's own page address. |
| The note shows no picture | The host did not share one. The video still plays. |
| "Too many videos looked up in the last hour" | You added 60 new videos in the last hour. Wait, then paste again. |
