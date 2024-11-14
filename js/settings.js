var i18={};

["hdrContent", "hdrLabel", "hintContent", "hintLabel", "text", "yes", "no", "ok", "cancel", "confirm",
"deleteRow", "addRow", "hintNewGroup", "savedSuccesfull", "newGroupName" ].forEach((item, index) => {
	i18[item]=browser.i18n.getMessage(item);
});


const emptyRow=`<div class="row mb-1 entry-row">
			<div class="col-12 col-sm-8">
				<div class="input-group">				  
					<button data-action="delete-me" class="btn btn-outline-danger" title="${i18.deleteRow}">&nbsp;</button>
					 <textarea class="form-control fld-text" placeholder="${i18.text}" aria-label="${i18.text}" rows="1"></textarea>
				</div>
			</div>
			<div class="col-12 col-sm-4">
				<div class="input-group">				  
					<input type="text" class="form-control fld-label" placeholder="${i18.hdrLabel}" aria-label="${i18.hdrLabel}" >
					<button data-action="add-new" class="btn btn-outline-success" title="${i18.addRow}">+</button>
				</div>
			</div>			
		</div>`;

const fieldsHdr=`<div class="row mb-1 entry-row">
			<div class="col-12 col-sm-8 fs-5" title="${i18.hintContent}">
				${i18.hdrContent}
			</div>
			<div class="col-12 col-sm-4 fs-5" title="${i18.hintLabel}">
				${i18.hdrLabel}
			</div>			
		</div>`;

const t_alert=`<div class="alert alert-danger alert-dismissible fade show" role="alert">
  <span id="content"></span>
  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
</div>   
`;
		
var groupLb=null;
var pluginSettings=null;

$(() => {
	utils.translateAttr();
	utils.translateText();
	
	groupLb=document.getElementById('grouplist');
	
	$("#bt_export_identities").on("click", (e) => {
		browser.storage.local.get().then((values) => {
			uploadLocal(JSON.stringify(values,null,"\t"), "fields.json", "text/plain");
		});
		
	});
	
	
	$("#bt_import_identities").on("click", (e) => {
		$("#selectedFile").trigger("click");
	});
	
	$("#selectedFile").on("change",(e) => {
		const fo=e.target.files[0];		
		fo.text().then( (txt) => { 
			let flds=JSON.parse(txt);
			browser.storage.local.clear().then( () =>
				browser.storage.local.set(flds).then( () => loadFields()));
			
		});
	});
	
	
	$("#bt-saveall").on("click",(e) => {		
		let selOpt=getSelOption(groupLb);
		
		let values={};
		values[selOpt.value]=[];
		let nr=0;
		$(".fieldlist .entry-row").each((idx,el) => {
			let txtVal=$(el).find("textarea.fld-text").val();
			if(txtVal) {
				values[selOpt.value].push({
					text: txtVal,
					title: $(el).find("input.fld-label").val(),
				});
			}
		});
		
		browser.storage.local.set(values).then( () => { 
			loadFields(selOpt.value);
			successAlert(i18.savedSuccesfull);
		});
		
	});

	$(".group-actions").on("click",(e) => {	
		switch(e.target.id) {
			case "bt-group-new":
				modalPrompt({ 
					title: i18.hintNewGroup,
					label: i18.newGroupName,
					value: '',
					ok: i18.ok,
					cancel: i18.cancel,
					callback: (inputVal) => newGroup(inputVal), 
				});
				break;
				
			case "bt-group-rename":
				let opt=getSelOption(groupLb);
				modalPrompt({ 
					title: browser.i18n.getMessage("dlgRename",opt.text),
					label: i18.newGroupName,
					value: '',
					ok: i18.ok,
					cancel: i18.cancel,
					callback: (inputVal) => renameGroup(opt.value,inputVal), 
				});
				break;
				
			case "bt-group-delete":
				let dOpt=getSelOption(groupLb);
				modalConfirm({ 
					title: i18.confirm,
					text: browser.i18n.getMessage("askDeleteGroup",dOpt.text),
					ok: i18.yes,
					cancel: i18.no,
					callback: () => deleteGroup(dOpt.value), 
				});
				break;
				
			case "bt-group-setdefault":
				let newDef=getSelOption(groupLb).value;
				db.setDefaultGroup(newDef)
					.then(() => loadFields(newDef));
				break;
				
				
			default:
				break;
		}
	});
	
	$("#grouplist").on("change",(e) => {
		loadFields( getSelOption(e.target).value);
	});
	
	$(".fieldlist").on("click",(e) => {		
		switch($(e.target).data("action")) {
			case "delete-me":
				let row=$(e.target).closest(".entry-row");
				if(row.find(".fld-text").val()) {
					if(confirm("Do you really want to delete this Text?")) {
						row.remove();
					}
				}
				else {
					row.remove();
				}					
				break;
			case "add-new":
				$(emptyRow).appendTo($(".fieldlist"));
				break;
			default:
				break;		
		}
	});
	
	
	$(".card.settings").on("change",(e) => {
		switch(e.target.id) {
			case "settings-browseraction":
				pluginSettings.actionButton=e.target.value;
				saveSettings(pluginSettings);
				break;
		}
	});
	
	loadSettings();
	loadFields();

});

function infoAlert(txt) { _alert("info",txt); }

function successAlert(txt) { _alert("success",txt); }

function warningAlert(txt) { _alert("warning",txt); }

function errorAlert(txt) { _alert("danger",txt); }

function _alert(type,txt) {

	let a=$(t_alert.replace("alert-danger","alert-" + type)).appendTo("body");
	a.find("#content").html(txt);
	
	var bAlert=bootstrap.Alert.getOrCreateInstance(a.get(0));
	
	setTimeout(() => {
		if(bAlert)
			bAlert.close();
	},4000);
}



function getSelOption(lb) {
	return lb.options[lb.selectedIndex];
}

function renameGroup(ref,newName) {
	db.renameGroup(ref,newName).then(() => {
		loadFields(ref);
	});
}

function newGroup(name) {
	db.addGroup(name).then((newGroup) => {
		loadFields(newGroup.ref);
	});
}

function deleteGroup(ref) {
	db.deleteGroup(ref).then(() => {
		loadFields();
	});
}

function saveSettings(settings) {
	db.saveSettings(settings).then(() => {
		successAlert(i18.savedSuccesfull);
	});
}

function loadSettings() {	
	db.getSettings().then((s) => {
		pluginSettings=s.settings;
		$("#settings-browseraction").val(s.settings.actionButton);
	});
		
}

function loadFields(selected=null) {
	db.getGroups().then((groups) => {
		let opt=db.mkGroupOptions(groups,selected);	
		$("#grouplist").empty();
		
		opt.options.forEach((o) => {
			$(o).appendTo($("#grouplist"));
		});
		
		$(".fieldlist").empty();
		db.getFields(getSelOption(groupLb).value).then((fields) => {
			showFieldList(fields);
		});
	});	
}

function showFieldList(values) {
	$(fieldsHdr).appendTo($(".fieldlist"));

	for(id in values) {		
		$(`<div class="row mb-1 entry-row">
			<div class="col-12 col-sm-8">
				<div class="input-group">				  
					<button data-action="delete-me" class="btn btn-outline-danger" title="${i18.deleteRow}">&nbsp;</button>
					 <textarea class="form-control fld-text" placeholder="${i18.text}" aria-label="${i18.text}" rows="1">${values[id].text}</textarea>
				</div>
			</div>
			<div class="col-12 col-sm-4">
				<div class="input-group">				  
					<input type="text" class="form-control fld-label" placeholder="${i18.hdrLabel}" aria-label="${i18.hdrLabel}" value="${values[id].title}">
					<button data-action="add-new" class="btn btn-outline-success" title="${i18.addRow}" >+</button>
				</div>
			</div>			
		</div>`).appendTo($(".fieldlist"));
	};
	
	$(emptyRow).appendTo($(".fieldlist"));	
}


function uploadLocal(content, fileName, contentType) {
 const a = document.createElement("a");
 const file = new Blob([content], { type: contentType });
 a.href = URL.createObjectURL(file);
 a.download = fileName;
 a.click();
}


const modalProps={
	title: "Input requested",
	label: "Input",
	value: null,
	ok: "Ok",
	cancel: "Cancel",
};

function modalPrompt(opts={}) {
	$(".modal.prompt .bt-ok").off("click"); //prevent cumulation of events
	
	let p=Object.assign({},modalProps, opts);
	
	$(".modal.prompt .modal-title").text(p.title);
	$(".modal.prompt .modal-body label").text(p.label);
	$(".modal.prompt .modal-footer .bt-ok").text(p.ok);
	$(".modal.prompt .modal-footer .bt-cancel").text(p.cancel);
	$(".modal.prompt .modal-body input").val(p.value);
	
	
	if(opts.callback)
		$(".modal.prompt .bt-ok").one("click",(e) => opts.callback($(e.target).closest(".modal").find("input").val()));
	
	bootstrap.Modal.getOrCreateInstance($(".modal.prompt").get(0)).show();
}

const modalConfirms={
	title: "Confirm",
	text: "",
	ok: "Yes",
	cancel: "No",
};

function modalConfirm(opts={}) {
	$(".modal.confirm .bt-ok").off("click"); //prevent cumulation of events
	$(".modal.confirm .bt-cancel").off("click"); //prevent cumulation of events
	
	let p=Object.assign({},modalConfirms, opts);
	
	$(".modal.confirm .modal-title").text(p.title);
	$(".modal.confirm .modal-body p.lead").text(p.text);
	$(".modal.confirm .modal-footer .bt-ok").text(p.ok);
	$(".modal.confirm .modal-footer .bt-cancel").text(p.cancel);
	
	
	if(opts.callback)
		$(".modal.confirm .bt-ok").one("click",(e) => opts.callback($(e.target).closest(".modal").find("input").val()));
	
	bootstrap.Modal.getOrCreateInstance($(".modal.confirm").get(0)).show();
}

