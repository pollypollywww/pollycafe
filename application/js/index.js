$(function() {
  $('.dropdown-item').on('click', function() {
    $('.navbar-collapse').collapse('hide');
  });

  $(".owl-carousel").owlCarousel({
    loop: false,
    margin:20,
    responseClass: true,
    responsive: {
        0: {
          items: 1,
        }
    }
  });

  axios.get("/load")
      .then(res => {
        //console.log(res.data.result);
        const itemList = res.data.result;
        loadItemData(itemList);
        loadComplete();
      })
      .catch(err => {
          let message = err.response.data.message;
          alert(message);
      });
});

function loadItemData(itemList){
  const cakeList = itemList.filter((item, key) => itemList[key].ItemType === "蛋糕");
  const breadList = itemList.filter((item, key) => itemList[key].ItemType === "麵包");
  const othersList = itemList.filter((item, key) => itemList[key].ItemType === "其他");
  const cbList = itemList.filter((item, key) => itemList[key].ItemType === "咖啡豆");
  //console.log("cakeList", cakeList)

  $("#cakeCard").empty();
  for(let item in cakeList){
    let strHTML = `
      <div class="col-md-6 col-lg-3">
      <div class="prouduct-card h-100 d-flex flex-column">
        <img src="images/${ cakeList[item].ItemImg }" class="img-fluid mx-auto d-block" alt="">
        <div class="product-detail p-3">
          <p class="pname">${ cakeList[item].ItemName }</p>
          <p class="text-secondary font-weight-bold">NT. ${ cakeList[item].ItemPrice } / <span>${ cakeList[item].ItemSize }</span></p>
          <p class="mb-0">${ cakeList[item].ItemVeg }</p>
          <p class="cbInfo">${ cakeList[item].ItemNote }</p>
        </div>
        <button type="button" class="btn add-to-cart add-btn w-100 mx-auto text-center mt-auto mb-4" data-id="${ cakeList[item].ItemId }" data-name="${ cakeList[item].ItemName }" data-size="${ cakeList[item].ItemSize }">加入購物車</button>
      </div>
    </div>
      
      `;
    $("#cakeCard").append(strHTML);
  }
  
  $("#breadCard").empty();
  for(let item in breadList){
    let strHTML = `
    <div class="col-md-6 col-lg-3">
    <div class="prouduct-card h-100 d-flex flex-column">
      <img src="images/${ breadList[item].ItemImg }" class="img-fluid mx-auto d-block" alt="">
      <div class="product-detail p-3">
        <p class="pname">${ breadList[item].ItemName }</p>
        <p class="text-secondary font-weight-bold">NT. ${ breadList[item].ItemPrice } / <span>${ breadList[item].ItemSize }</span></p>
        <p class="mb-0">${ breadList[item].ItemVeg }</p>
        <p class="cbInfo">${ breadList[item].ItemNote }</p>
      </div>
      <button type="button" class="btn add-to-cart add-btn w-100 mx-auto text-center mt-auto mb-4" data-id="${ breadList[item].ItemId }" data-name="${ breadList[item].ItemName }" data-size="${ breadList[item].ItemSize }">加入購物車</button>
    </div>
  </div>`;
    $("#breadCard").append(strHTML);
  }

  $("#othersCard").empty();
  for(let item in othersList){
    let strHTML = `
      <div class="col-md-6 col-lg-3">
      <div class="prouduct-card h-100 d-flex flex-column">
        <img src="images/${ othersList[item].ItemImg }" class="img-fluid mx-auto d-block" alt="">
        <div class="product-detail p-3">
          <p class="pname">${ othersList[item].ItemName }</p>
          <p class="text-secondary font-weight-bold">NT. ${ othersList[item].ItemPrice } / <span>${ othersList[item].ItemSize }</span></p>
          <p class="mb-0">${ othersList[item].ItemVeg }</p>
          <p class="cbInfo">${ othersList[item].ItemNote }</p>
        </div>
        <button type="button" class="btn add-to-cart add-btn w-100 mx-auto text-center mt-auto mb-4" data-id="${ othersList[item].ItemId }" data-name="${ othersList[item].ItemName }" data-size="${ othersList[item].ItemSize }">加入購物車</button>
      </div>
    </div>`;
    $("#othersCard").append(strHTML);
  }

  $("#cbCard").empty();
  for(let item in cbList){
    let strHTML = `
      <div class="col-md-6 col-lg-3">
      <div class="prouduct-card h-100 d-flex flex-column">
        <img src="images/${ cbList[item].ItemImg }" class="img-fluid mx-auto d-block" alt="">
        <div class="product-detail p-3">
          <p class="pname">${ cbList[item].ItemName }</p>
          <p class="text-secondary font-weight-bold">NT. ${ cbList[item].ItemPrice } / <span>${ cbList[item].ItemSize }</span></p>
          <p class="mb-0">${ cbList[item].BeanType }</p>
          <p class="cbInfo">${ cbList[item].ItemNote }</p>
        </div>
        <button type="button" class="btn add-to-cart add-btn w-100 mx-auto text-center mt-auto mb-4" data-id="${cbList[item].ItemId }" data-name="${ cbList[item].ItemName }" data-size="${ cbList[item].ItemSize }">加入購物車</button>
      </div>
    </div>`;
   $("#cbCard").append(strHTML);
  }
}

function loadComplete(){
$(".add-to-cart").on("click", function(){
  let ItemId = $(this).data("id");
  let ItemName = $(this).data("name");
  let ItemSize = $(this).data("size");
  //console.log(ItemId, ItemName, ItemSize);
  
  axios.post("/cart", { ItemId, ItemName, ItemSize })
    .then(res => {
      swal("商品已加入購物車", "", "success");
    })
    .catch(err => {
      let message = err.response.data.message;
      alert(message);
    });
});
}