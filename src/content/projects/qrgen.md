---
architecture:
  nodes:
    - { id: tab, label: Current tab, sub: chrome.tabs, col: 0, row: 0, tone: ext }
    - { id: ui, label: React 19 popup, sub: six content types, col: 1, row: 0, tone: client }
    - { id: enc, label: Payload encoder, sub: Wi-Fi · vCard · mailto, col: 2, row: 0 }
    - { id: qr, label: qrcode, sub: error correction L to H, col: 2, row: 1 }
    - { id: guard, label: Contrast guard, sub: blocks below 3:1, col: 1, row: 1 }
    - { id: out, label: Export, sub: PNG · SVG · clipboard, col: 0, row: 1, tone: data }
  edges:
    - [tab, ui]
    - [ui, enc]
    - [enc, qr]
    - [qr, guard]
    - [guard, out]
order: 6
accent: ['#f43f5e', '#facc15']
demo: qr
title: QRGen
date: 2026-10-18
kind: project
summary: A Chrome extension that makes QR codes for the page you're on, or for Wi-Fi, contacts and more.
role: Solo, end to end
stack: [TypeScript, React 19, Chrome Manifest V3]
facts:
  - Makes no network requests at all
  - Styled codes keep their finder patterns solid, and low-contrast colours are blocked so codes still scan
  - Wi-Fi passwords are never saved to history
commits: 8
links:
  code: https://github.com/me-adityaraj8/qrgen
---

## What it does

Open it and the QR code for the current tab is already there. It also makes codes for Wi-Fi networks, vCard contacts, email, phone numbers and plain text, each in the standard format phone cameras understand.

## Styles that still scan

There are six styles, custom colours and an optional centre logo. Finder and alignment patterns always stay solid, colour pairs without enough contrast are blocked, and adding a logo switches error correction to level H so the code keeps scanning.

## Private by construction

No account, no analytics and no network requests. History lives on your device, and Wi-Fi passwords are never stored.
