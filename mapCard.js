function createCard(name, address, author, date, img_path, id) {
    date_added = new Date(date);
    date_str = date_added.getDate().toString() + ". " + (date_added.getMonth()+1).toString() + ". " + date_added.getFullYear().toString();

    var c = new SMap.Card();
    c.getHeader().innerHTML = '<p class="ginkgo_card_name"><b>'+name+'</b></p><img onclick="removeGinkgo('+id+');" class="ginkgo_card_remove" src=images/remove.png /><img onclick="editingGinkgo('+id+');" class="ginkgo_card_edit" src=images/edit.png />';
    c.getFooter().innerHTML = '<div class="ginkgo_card"><p class="ginkgo_card_address">'+address+'</p><p>Přidal: '+author+"<br>("+date_str+")</p></div>";
    c.getBody().style.margin = "0px";
    if (img_path !== "")
        c.getBody().innerHTML = '<img src="'+img_path+'" class="ginkgo_card_img">';
    else
        c.getBody().innerHTML = 'Toto ginkgo nemá žádný obrázek';
    return c;
}