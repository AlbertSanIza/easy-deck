# Google Slides API Guide

This document explains the capabilities of the Google Slides API and how they're used in Easy Deck.

## Overview

The Google Slides API allows you to programmatically create, read, and update Google Slides presentations. Easy Deck uses this API to enable AI-powered slide generation and editing.

## Key Capabilities

### 1. Presentation Management

**Create Presentations**

```typescript
POST https://slides.googleapis.com/v1/presentations
{
  "title": "My Presentation"
}
```

**Get Presentation Details**

```typescript
GET https://slides.googleapis.com/v1/presentations/{presentationId}
```

**Update Presentations**

```typescript
POST https://slides.googleapis.com/v1/presentations/{presentationId}:batchUpdate
{
  "requests": [...]
}
```

### 2. Slide Operations

**Create Slides**

- Add new slides with predefined layouts (BLANK, TITLE, TITLE_AND_BODY, etc.)
- Insert slides at specific positions
- Duplicate existing slides

**Delete Slides**

- Remove slides by object ID

**Reorganize Slides**

- Move slides to different positions
- Reorder slide sequence

### 3. Content Manipulation

**Text Operations**

- Insert text into text boxes
- Update existing text
- Format text (bold, italic, font size, color)
- Create bulleted/numbered lists
- Add paragraphs and line breaks

**Shape Operations**

- Insert shapes (rectangles, circles, lines, etc.)
- Modify shape properties (fill, border, size, position)
- Add text to shapes

**Image Operations**

- Insert images from URLs
- Replace existing images
- Crop and resize images

**Table Operations**

- Create tables with specified rows/columns
- Insert data into table cells
- Format table cells

### 4. Layout and Design

**Slide Layouts**

- Apply predefined layouts
- Create custom layouts
- Change slide dimensions

**Theme and Styling**

- Apply themes
- Modify color schemes
- Update fonts and typography

**Master Slides**

- Work with master slide templates
- Apply master slide layouts

### 5. Advanced Features

**Page Elements**

- Access all page elements (text boxes, images, shapes, etc.)
- Modify element properties
- Group and ungroup elements

**Animations**

- Add slide transitions
- Create object animations

**Notes and Comments**

- Add speaker notes
- Insert comments

## Common API Requests

### Add a New Slide

```json
{
    "requests": [
        {
            "createSlide": {
                "insertionIndex": 0,
                "slideLayoutReference": {
                    "predefinedLayout": "BLANK"
                }
            }
        }
    ]
}
```

### Insert Text

```json
{
    "requests": [
        {
            "insertText": {
                "objectId": "{textBoxId}",
                "text": "Hello, World!",
                "insertionIndex": 0
            }
        }
    ]
}
```

### Create Text Box

```json
{
    "requests": [
        {
            "createShape": {
                "objectId": "{newTextBoxId}",
                "shapeType": "TEXT_BOX",
                "elementProperties": {
                    "pageObjectId": "{slideId}",
                    "size": {
                        "height": { "magnitude": 100, "unit": "PT" },
                        "width": { "magnitude": 300, "unit": "PT" }
                    },
                    "transform": {
                        "scaleX": 1,
                        "scaleY": 1,
                        "translateX": 100,
                        "translateY": 100,
                        "unit": "PT"
                    }
                }
            }
        }
    ]
}
```

### Update Text Style

```json
{
    "requests": [
        {
            "updateTextStyle": {
                "objectId": "{textBoxId}",
                "style": {
                    "bold": true,
                    "fontSize": {
                        "magnitude": 24,
                        "unit": "PT"
                    }
                },
                "fields": "bold,fontSize"
            }
        }
    ]
}
```

### Insert Image

```json
{
    "requests": [
        {
            "createImage": {
                "objectId": "{newImageId}",
                "url": "https://example.com/image.jpg",
                "elementProperties": {
                    "pageObjectId": "{slideId}",
                    "size": {
                        "height": { "magnitude": 200, "unit": "PT" },
                        "width": { "magnitude": 300, "unit": "PT" }
                    },
                    "transform": {
                        "scaleX": 1,
                        "scaleY": 1,
                        "translateX": 100,
                        "translateY": 100,
                        "unit": "PT"
                    }
                }
            }
        }
    ]
}
```

## Implementation in Easy Deck

### Current Implementation

1. **Token Management** (`src/convex/googleSlides.ts`)
    - Stores OAuth tokens securely
    - Handles token expiration
    - Provides token retrieval

2. **Presentation Operations**
    - `createPresentation`: Creates new Google Slides presentations
    - `getPresentation`: Retrieves presentation details
    - `updateSlide`: Updates slide content via batch requests
    - `addSlide`: Adds new slides to presentations

3. **AI Integration** (`src/convex/ai.ts`)
    - Chat interface that understands user intent
    - Generates appropriate API requests
    - Executes changes to Google Slides

### Future Enhancements

The AI chat can be enhanced to:

- Understand natural language requests
- Generate complex multi-step operations
- Suggest improvements based on presentation content
- Handle image insertion from URLs
- Apply themes and styling
- Create complex layouts with multiple elements

## OAuth Scopes Required

- `https://www.googleapis.com/auth/presentations` - Full access to create and edit
- `https://www.googleapis.com/auth/presentations.readonly` - Read-only access

## Rate Limits

Google Slides API has rate limits:

- 60 requests per minute per user
- 300 requests per 100 seconds per project

The implementation should include rate limiting and retry logic for production use.

## Error Handling

Common errors:

- `401 Unauthorized`: Token expired or invalid
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Presentation or slide doesn't exist
- `429 Too Many Requests`: Rate limit exceeded

## Resources

- [Google Slides API Documentation](https://developers.google.com/slides/api)
- [API Reference](https://developers.google.com/slides/api/reference/rest)
- [Request Examples](https://developers.google.com/slides/api/guides/batch-update)
