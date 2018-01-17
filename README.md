# spreadsheet-collator

Collate Google Form responses into Google Docs.

## Set up

You will need:

* A Google Spreadsheet - the first row should be the header for each column.
* A Google Drive folder

### Update config.js

1. Open up config.js.
2. Enter the spreadsheet's ID as the value for `spreadsheetId`. To find this value, look at the URL. Copy and paste the long string of characters from the URL.
3. Enter the spreadsheet tab's range as the value for `spreadsheetRange`. This will be the tab's name and the column/row range. For example: `Form Responses 1!B1:E9`.
4. Enter the heading title in your spreadsheet that will act as the title for your Google Docs as `title`.
5. Enter the Drive folder ID as the value for `driveFolderId`. To find this value, open up the folder and look at the URL. Copy and paste the long string of characters from the URL.

### Authenticate and run

For first time use, run:

```
npm install
npm link
```

Next run:

```
collate
```

Terminal will provide you a URL to visit so you can authenticate your Google account to enable this script to read your spreadsheet and create the files.

After you paste the code back into Terminal and hit enter, you should see: `Token stored to ./spreadsheet-collator.json`.

## Run the script

Once you have completed all steps of the set up, run the command once again:

```
collate
```

Terminal will tell you how many Google Docs it created and the titles for each. Open up your Drive folder to see them!
