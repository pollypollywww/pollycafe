function addItem(){
    $("#add_btn").on("click", function(){
        let ItemType = $("#item_type").val();
        let ItemName = $("#item_name").val();
        let ItemPrice = $("#item_price").val();
        let ItemSize = $("#item_size").val();
        let ItemVeg = $("input[type='radio'][name='item_veg']:checked").val();

        //checkbox讀取
        const bean_collect = [];
        $.each($("input[name='bean_type']:checked"), function(){
            bean_collect.push($(this).val());
        });
        let BeanType =  bean_collect.join(" / ");
        //console.log(BeanType);

        let ItemNote = $("#item_note").val();
        let ItemImg = $("#item_img").val();
        let ItemLaunch = $("input[type='radio'][name='item_launch']:checked").val();
        
        axios.post("/admin/item/add", {ItemType, ItemName, ItemPrice, ItemSize, ItemVeg, BeanType, ItemNote, ItemImg, ItemLaunch})
            .then(res => {
                let message = res.data.message;
                alert(message);
                if (message === "新增成功") location.href = "/admin/item/list";
            })
            .catch(err => {
                let message = err.response.data.message;
                alert(message);
            });
    });
}

function editItem(){
    $("#update_btn").on("click", function(){
        let ItemType = $("#item_type").val();
        let ItemName = $("#item_name").val();
        let ItemPrice = $("#item_price").val();
        let ItemSize = $("#item_size").val();
        let ItemVeg = $("input[type='radio'][name='item_veg']:checked").val();
        
        const bean_collect = [];
        $.each($("input[name='bean_type']:checked"), function(){
            bean_collect.push($(this).val());
        })
        let BeanType = bean_collect.join(' / ');

        let ItemNote = $("#item_note").val();
        let ItemImg = $("#item_img").val();
        let ItemLaunch = $("input[type='radio'][name='item_launch']:checked").val();
        
        axios.put("/admin/item/edit/" + ItemId, {ItemType, ItemName, ItemPrice, ItemSize, ItemVeg, BeanType, ItemNote, ItemImg, ItemLaunch})
        .then(res => {
            let message = res.data.message;
            alert(message);
            if (message === "更新成功") location.href = "/admin/item/list";
        })
        .catch(err => {
            let message = err.response.data.message;
            alert(message);
        });
    });

    $("#delete_btn").on("click", function(){
        if(confirm('確認要刪除品項ID: ' + ItemId + '?')){
            // console.log(ItemId);
            axios.put("/admin/item/edit/delete/" + ItemId)
            .then(res => {
                let message = res.data.message;
                alert(message);
                if (message === "刪除成功") location.href = "/admin/item/list";
            })
            .catch(err => {
                let message = err.response.data.message;
                alert(message);
            });
        };
    });
}