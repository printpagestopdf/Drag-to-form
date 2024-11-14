class utils {
	
	static translateAttr(attr="title") {
		let data=attr + "Intl";
		$("[data-" + attr + "-intl]").each(( idx, el ) => {
			el[attr]=browser.i18n.getMessage(el.dataset[data]);
		});
	}
	
	static translateText() {
		$("[data-text-intl]").each(( idx, el ) => {
			el.textContent=browser.i18n.getMessage(el.dataset.textIntl);
		});
	}
}