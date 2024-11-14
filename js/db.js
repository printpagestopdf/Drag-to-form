class db {
	
	static defSettings={
		actionButton: "popup", /* popup, sidebar */
	};
	
	static getSettings() {
		return browser.storage.local.get({ settings : this.defSettings });
	}
	
	static saveSettings(settings) {
		return browser.storage.local.set( { settings: settings });
	}
	
	static getGroups() {
		return new Promise((resolve,reject) => {
			browser.storage.local.get("groups").then(res => resolve(res.groups)); 
		});
	}
	
	static getDefGroup(groups=null) {
		const findDef=(groups) => {
					for(let i=0; i < groups.length;i++)
						if( groups[i].isDefault) return groups[i];			
				};
		
		if(groups) return Promise.resolve(findDef(groups));
		
		return new Promise((resolve,reject) => {
			this.getGroups().then((res) => {
				resolve(findDef(res.groups));
			});
		});
	}
		
	static getFields(group) {
		return new Promise((resolve,reject) => {
			let ref=(typeof group === 'string')?group:group.ref;
			browser.storage.local.get(ref).then( (res) => {
				resolve( res[ref]);
			});
		});
	}

	static mkGroupOptions(groups, selected=null) {
		let defGroup=null;
		let options=[];
		let sel='';
		let marker='';
		groups.forEach((group) => {
			if(selected)
				sel=(group.ref == selected)?' selected="selected" ':'';
			else
				sel=(group.isDefault)?' selected="selected" ':'';
			
			if(group.isDefault ) defGroup=group;
			
			marker=group.isDefault?" *":'';
			options.push($(`<option value="${group.ref}" ${sel}>${group.title}${marker}</option>`));
		});
		return { options: options, defgroup: defGroup };
	}
	
	static addGroup(name) {
		return new Promise((resolve,reject) => {
			this.getGroups().then((groups) => {
				let gid=0;
				groups.forEach((group) => {
					let curGid=parseInt(group.ref.replace("group-",""));
					if(curGid > gid) gid=curGid;
				});
				gid++;
				let newGid="group-" + gid;
				let newGroup={
					title: name,
					isDefault: false,
					ref: newGid
				};
				groups.push(newGroup);
				
				browser.storage.local.set({
					"groups": groups,
					[newGid]: []
				}).then( () => resolve(newGroup));			
			});
		});
	}
	
	static setDefaultGroup(ref) {
		return new Promise((resolve,reject) => {
			this.getGroups().then((groups) => {

				groups.forEach((group) => {
					group.isDefault=(group.ref == ref);
				});
				
				browser.storage.local.set({
					"groups": groups
				}).then( () => resolve(true));			
			});
		});
		
	}
	
	static deleteGroup(ref) {
		return new Promise((resolve,reject) => {
			this.getGroups().then((groups) => {
				
				for (let i = groups.length - 1; i >= 0; i--) {
					if (groups[i].ref === ref) { 
						groups.splice(i, 1);
						break;
					}
				}
				
				browser.storage.local.set({
					"groups": groups
				}).then( () => {
					browser.storage.local.remove(ref).then(() => resolve(true))				
				});			
			});
		});
		
	}
	
	static renameGroup(ref, newName) {
		return new Promise((resolve,reject) => {
			this.getGroups().then((groups) => {

				groups.forEach((group) => {
					if(group.ref == ref)
						group.title=newName;
				});
				
				browser.storage.local.set({
					"groups": groups
				}).then( () => resolve(true));			
			});
		});
		
	}
}