function createCard(name, address, author, date, img_path, id, img_style = "wide") {
    card = createCardPreview(name, address, author, date, img_path, img_style);
    card.getHeader().innerHTML += '<img onclick="removeGinkgo('+id+');" class="ginkgo_card_remove" src=images/remove.png /><img onclick="editingGinkgo('+id+');" class="ginkgo_card_edit" src=images/edit.png />';
    return card;
}