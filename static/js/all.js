/**
 * Created by Ирина on 20.01.2017.
 */

//list
var infinityList = {};
var pageHeight;
var winHeight;
function updateGeneral(infinityList) {
    pageHeight = parseInt($(document).height());
    winHeight = parseInt($(window).height());
}
function init(infinityList) {
    $('#loading_block').hide();
    updateGeneral(infinityList);
    var scrollIndex = 1;
    var error_lock = false;
    var load_lock = false;
    var end_of_list = false;
    $(document).scroll(function () {
        var pos = parseInt($(document).scrollTop());
        if ((pos + winHeight > pageHeight) &&
            (!load_lock) && (!end_of_list)) {
            $('#loading_block').show();
            scrollIndex++;
            load_lock = true;
            $.ajax({
                url: '/main/' + scrollIndex,
                type: 'GET',
                data: {},
                dataType: 'text',
                timeout: 60000,
                success: function (response) {
                    if (response.trim() == 'Finish') {
                        end_of_list = true;
                    } else {
                        $('#loading_block').before(response);
                    }
                    $('#loading_block').hide();
                    updateGeneral(infinityList);
                    load_lock = false;
                },
                error: function () {
                    if (!error_lock) {

                        error_lock = true;
                        $(document).scrollTop(0);
                        alert('ошибка');
                        setTimeout(function () {
                            location.reload();
                        }, 1);
                    }
                }
            });
        } else {
            $('#loading_block').hide();
        }
    });
    $(window).resize(function () {
        updateGeneral(infinityList);
    });
}

//list
$(document).ready(function () {
    init(infinityList);
    var o;
    $('#addnew').click(function (e) {
        e.preventDefault();
        $("#ModalNew").modal('show');

        var computers;
        $.ajax({
            type: "GET",
            url: "/computers",
            success: function (data) {
                computers = data;
            },
            error: function () {
                alert("error");
            }
        });
        $('#error').hide();
        var errors = '';
        $('#add').attr('disabled', 'True')
        var jVal = {
            'Form': function () {
                $('#error').hide();
                errors = '';
                var ele = $('#id_name');
                if ((ele.val().length == 0) || (ele.val().length > 255)) {
                    errors += "Wrong username (too long or too short); "
                }
                var i;
                for (i = 0; i < computers.length; i++) {
                    if (ele.val() == computers[i]) {
                        errors += "Such computer already exists; "
                    }
                }
                var input = $('input[type=file]');
                if (input.val().length == 0) {
                    errors += "Add picture, please; "
                }
                if (errors != '') {
                    $('#msg').html(errors);
                    $('#error').attr('class', 'alert alert-warning');
                    $('#error').show();
                }
                if (errors == '') {
                    $('#msg').html('OK');
                    $('#error').attr('class', 'alert alert-success');
                    $('#error').show();
                    $('#add').removeAttr('disabled');
                }
            }
        };
        $('#id_name').change(jVal.Form);
        $('input[type=file]').change(jVal.Form);
        $('#modaltable').find('input, select').each(function () {
            if ((($(this).attr('name') == 'price') || ($(this).attr('name')) == 'quantity') && ($(this).val() == '0')) {
                $(this).val(parseInt('0'));
            }
        })
    })
})

//orders
$(document).ready(function () {
    var ord_id
    //модальное
    $('#orders').find('>tbody>tr>td>button#items').click(function (e) {
        e.preventDefault();
        var ord_id = $(this).attr("name");
        ord_id = String(ord_id);
        $('#myModal' + ord_id).modal('show');
        $('#myModal' + ord_id).on('shown.bs.modal', function () {
            $('#myModal' + ord_id).find('a#item_del').click(function (e) {
                e.preventDefault();
                var item_to_del = $(this).attr("name");
                var quantity = $('#q_' + item_to_del).html();
                var new_quantity = parseInt(quantity) - 1;
                var total = $('#total' + ord_id).html();
                var price = $('#price' + item_to_del).html();
                var new_total = parseInt(total) - parseInt(price);
                var row = $(this).parent().parent();
                $.post("/orders/deleteitem/", {
                        "ordercode": ord_id,
                        'item': item_to_del
                    },
                    function () {
                        $('#total' + ord_id).html(String(new_total));
                        if (new_quantity != 0) {
                            $('#q_' + item_to_del).html(String(new_quantity));
                        }
                        else
                            row.remove()
                    });
            });

        });
    });


//закрытие заказа
    $('#orders').find('>tbody>tr>td>a').click(function (e) {
        e.preventDefault();
        ord_id = $(this).attr("id");
        var p = document.getElementById('is_open' + ord_id);
        $(this).hide();
        $.post("/orders/close-" + ord_id, {
                "ordercode": ord_id
            },
            function () {
                p.innerHTML = 'No';
            });
    });
//удаление заказа
    $('#orders').find('>tbody>tr>td>button#del').click(function (e) {
        e.preventDefault();
        ord_id = $(this).attr("name");
        var index = $(this).parent().parent();
        $.post("/orders/delete-" + ord_id, {
                "ordercode": ord_id
            },
            function () {
                index.remove()
            });
    });


})

//registration
$(document).ready(function () {
    $("#telephone").mask("+7(999) 999-9999");
    $('#birth_date').mask("99/99/9999")
    $("#msg").click(function () {
        var el = document.getElementById("#sign_up")
        $("#err").removeChild(el);
    });
});

//login
$(document).ready(function () {
    $("#msg").click(function () {
        var el = document.getElementById("#sign_in")
        $("#err").removeChild(el);
    });
});


//object.html
$(document).ready(function () {
    var o;
    $('.col-md-offset-8').find('#ord').click(function (e) {
        e.preventDefault();
        o = $(this).attr('name');
        $("#myModal").modal('show');
        $('#add').click(function (e) {
            e.preventDefault();
            var ord_id = $("select option:selected").val();
            var count = parseInt($('#available').html()) - 1;
            var ord_data = {
                'ord_id': ord_id,
                'i_name': o,
            };
            $.post("/main/add", ord_data,
                function () {
                    $('#available').html(String(count));
                    if (count == 0) {
                        $('#add').hide();
                        $('.col-md-offset-8').find('#ord').attr('disabled', true);
                    }


                });
        });

    });
});
