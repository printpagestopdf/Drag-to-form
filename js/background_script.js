browser.runtime.onInstalled.addListener(async (details) => { 
	switch(details.reason) {
		case "install":
			initEmptyDB();
			startupExtension();
			break;
		case "update":
			initEmptyDB();
			startupExtension();
			break;
		default:
			break;
	}
});

browser.runtime.onStartup.addListener(() => {
	startupExtension(); 
});

document.addEventListener("DOMContentLoaded", function(event) {
	startupExtension();
});
  

browser.browserAction.onClicked.addListener((tab,OnClickData) => {
	browser.sidebarAction.toggle();			
});

browser.storage.local.onChanged.addListener((changes) => {
	if(changes?.settings?.newValue?.actionButton !== undefined)
		setBrowserAction(changes.settings.newValue)	
});

var isStarted=false;
var settings=null;

const defSettings={
	actionButton: "popup", /* popup, sidebar */
};


function startupExtension(){
	if(!isStarted)
		isStarted=true;
	else
		return;
	
	browser.storage.local.get({ settings : defSettings }).then((s) => {
		setBrowserAction(s.settings);
	});
	
	buildActionMenu();	
}


function setBrowserAction(settings) {
	if(settings.actionButton == "popup")
		browser.browserAction.setPopup({ popup: null });
	else if(settings.actionButton == "sidebar")
		browser.browserAction.setPopup({ popup: "" });
	
}

function initEmptyDB() {
	browser.storage.local.get({"groups":null, }).then((values) => {
		if(values.groups == null){
			browser.storage.local.set({
				"groups": [
					{
						"title": "Example Group",
						"isDefault": true,
						"ref": "group-0"
					}
				],
				"group-0": [{ text: "Example Text 1", title: "Ex Field 1" },{ text: "Example Text 2", title: "Ex Field 2" }]
			}).then(() => startupExtension());
		}
	});	 			
	
}

function buildActionMenu() {
	browser.menus.removeAll().then(() => {
		browser.menus.create({
			id: "ff_settings",
			title: "Settings",
			icons: {
				"16": "icons/FieldFillerR.svg",
				"32": "icons/FieldFillerR.svg"
			  },
			contexts: [ "browser_action" ],
			onclick: (info,tab) => 	browser.runtime.openOptionsPage(),

		},() => browser.menus.refresh());
		
		browser.menus.create({
			id: "ff_sidebar",
			title: "Sidebar",
			icons: {
				"16": "icons/FieldFillerR.svg",
				"32": "icons/FieldFillerR.svg"
			  },
			contexts: [ "browser_action" ],
			command: "_execute_sidebar_action",
		},() => browser.menus.refresh());
		
	});
}
