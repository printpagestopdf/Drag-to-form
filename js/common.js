$(() => {
	utils.translateAttr();
	
	document.addEventListener("dragstart",(e) => {
		$("#drag_ghost").html($(e.target).attr("title"));
		e.dataTransfer.setData ("text/plain" , $(e.target).attr("title"));
		e.dataTransfer.setDragImage(document.getElementById("drag_ghost"),0,0);
	});
	
	$("#grouplist").on("change",(e) => {
		loadFields(e.target.options[e.target.selectedIndex].value);
	});
	
	browser.storage.local.onChanged.addListener((changes) => {
		let sel=document.getElementById("grouplist");
		let group=sel.options[sel.selectedIndex].value;
		if(changes?.groups?.newValue !== undefined || changes?.[group]?.newValue !== undefined)
			loadFields(group);
	});
	

	$("#bt-settings").on("click",(e) => {
		browser.runtime.openOptionsPage();	
	});
	
	$("#bt-sidebar").on("click",(e) => {
		browser.sidebarAction.toggle();	
	});
	
	loadFields();	
});


function loadFields(selected=null) {
	db.getGroups().then((groups) => {
		let opt=db.mkGroupOptions(groups,selected);	
		$("#grouplist").empty();
		
		opt.options.forEach((o) => {
			$(o).appendTo($("#grouplist"));
		});
		
		$(".fieldlist").empty();
		let selGroup=document.getElementById('grouplist').value;
		db.getFields(selGroup).then((fields) => {
			showFieldList(fields);
		});
	});	
}


function showFieldList(values) {
	let disp='';
	for(id in values) {
		disp=values[id].title?values[id].title:values[id].text;
		$(`<div class="txt-item" draggable="true"  title="${values[id].text}">${disp}</div>`).appendTo($(".fieldlist"));
	};	
}
