/*
* 2007-2016 PrestaShop
*
* NOTICE OF LICENSE
*
* This source file is subject to the Academic Free License (AFL 3.0)
* that is bundled with this package in the file LICENSE.txt.
* It is also available through the world-wide-web at this URL:
* https://opensource.org/licenses/afl-3.0.php
* If you did not receive a copy of the license and are unable to
* obtain it through the world-wide-web, please send an email
* to license@prestashop.com so we can send you a copy immediately.
*
* DISCLAIMER
*
* Do not edit or add to this file if you wish to upgrade PrestaShop to newer
* versions in the future. If you wish to customize PrestaShop for your
* needs please refer to https://www.prestashop.com for more information.
*
*  @author PrestaShop SA <contact@prestashop.com>
*  @copyright  2007-2016 PrestaShop SA
*  @license    https://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
*  International Registered Trademark & Property of PrestaShop SA
*/

$(document).ready(function() {
    $(document).on('change', '#id_country', function() {
        resetAjaxQueries();
        updateStateByIdCountry();
    });

    if (SE_RefreshMethod == 0)
    {
        $(document).on('change', '#id_state', function() {
            resetAjaxQueries();
            updateCarriersList();
        });

        $(document).on('keyup', '#zipcode', function(e) {
            if (e.keyCode == '13') {
                resetAjaxQueries();
                updateCarriersList();
            }
        });
    }

    $(document).on('click', '#update_carriers_list', function() {
        updateCarriersList();
    });

    $(document).on('click', '#carriercompare_submit', function() {
        resetAjaxQueries();
        simulateSelection();
        return false;
    });

    $(document).on('change', "input[name='carrier_id']", function() {
        disableUpdateCart();
    });

    updateStateByIdCountry();
    disableUpdateCart();
});


var ajaxQueries = new Array();

function displayWaitingAjax(type, message)
{
    $('#SE_AjaxDisplay').find('p').html(message);
    $('#SE_AjaxDisplay').css('display', type);

    if(type == "block")
        $('#update_carriers_list').attr("disabled", "disabled");
    else if(type == "none")
        $('#update_carriers_list').removeAttr("disabled");

    disableUpdateCart();
}

function disableUpdateCart()
{
    var checked = $('input[name="carrier_id"]:checked').val()
    if(typeof checked == "undefined")
        $('#carriercompare_submit').attr("disabled", "disabled");
    else
        $('#carriercompare_submit').removeAttr("disabled");
}

function updateStateByIdCountry()
{
    $('#id_state').children().remove();
    $('#availableCarriers').slideUp('fast');
    $('#states').slideUp('fast');
    displayWaitingAjax('block', SE_RefreshStateTS);

    var query = $.ajax({
        type: 'POST',
        headers: { "cache-control": "no-cache" },
        url: baseDir + 'modules/carriercompare/ajax.php' + '?rand=' + new Date().getTime(),
        data: 'method=getStates&id_country=' + $('#id_country').val(),
        dataType: 'json',
        success: function(json) {
            if (json.length)
            {
                for (state in json)
                {
                    $('#id_state').append('<option value=\''+json[state].id_state+'\' '+(id_state == json[state].id_state ? 'selected="selected"' : '')+'>'+json[state].name+'</option>');
                }
                $('#states').slideDown('fast');
                if (!!$.prototype.uniform)
                    $.uniform.update("#id_state");
            }
            if (SE_RefreshMethod == 0)
                updateCarriersList();
            displayWaitingAjax('none', '');
        }
    });
    ajaxQueries.push(query);
}

function updateCarriersList()
{
    $('#carriercompare_errors_list').children().remove();
    $('#availableCarriers').slideUp('normal', function(){
        $(this).find(('tbody')).children().remove();
        $('#noCarrier').slideUp('fast');
        displayWaitingAjax('block', SE_RetrievingInfoTS);

        var query = $.ajax({
            type: 'POST',
            headers: { "cache-control": "no-cache" },
            url: baseDir + 'modules/carriercompare/ajax.php' + '?rand=' + new Date().getTime(),
            data: 'method=getCarriers&id_country=' + $('#id_country').val() + '&id_state=' + $('#id_state').val() + '&zipcode=' + $('#zipcode').val(),
            dataType: 'json',
            success: function(json) {
                if (json.length)
                {
                    var html  = '';
                    $.each(json, function(index, carrier)
                    {
                        html += '<tr class="'+(index % 2 ? 'alternate_' : '')+'item">'+
                                    '<td class="" width="64px">'+
                                        '&nbsp; <input type="radio" name="carrier_id" value="'+ carrier.id_carrier +'" id="id_carrier'+carrier.id_carrier+'" '+(id_carrier == carrier.id_carrier ? 'checked="checked"' : '')+'/>'+
                                    '</td>'+
                                    '<td class="carrier_name">'+
                                        '<label for="id_carrier'+carrier.id_carrier+'">'+
                                        (carrier.img ? '<img src="'+carrier.img+'" alt="'+carrier.name+'" />' : carrier.name)+
                                        '</label>'+
                                    '</td>'+
                                    '<td class="carrier_infos">'+
                                        ((carrier.delay != null) ? carrier.delay : '') +
                                    '</td>'+
                                    '<td class="carrier_price">';

                                        if (carrier.price)
                                        {
                                            html += '<span class="price">'+(displayPrice == 1 ? formatCurrency(carrier.price_tax_exc, currencyFormat, currencySign, currencyBlank) : formatCurrency(carrier.price, currencyFormat, currencySign, currencyBlank))+'</span>';
                                        }
                                        else
                                        {
                                            html += txtFree;
                                        }

                        html += 	'</td>'+
                                '</tr>';
                    });
                    $('#carriers_list').append(html);

                    displayWaitingAjax('none', '');
                    $('#availableCarriers').slideDown();
                }
                else
                {
                    displayWaitingAjax('none', '');
                    $('#noCarrier').slideDown();
                }
            }
        });
        ajaxQueries.push(query);
    });

}

function simulateSelection()
{
    $('#carriercompare_errors').slideUp();
    $('#carriercompare_errors_list').children().remove();

    var query = $.ajax({
        type: 'POST',
        headers: { "cache-control": "no-cache" },
        url: baseDir + 'modules/carriercompare/ajax.php' + '?rand=' + new Date().getTime(),
        data: 'method=simulateSelection&' + $('#compare_shipping_form').serialize(),
        dataType: 'json',
        success: function(json) {
            if (json.price != 0)
            {
                var price = formatCurrency(json.price, currencyFormat, currencySign, currencyBlank);
                $('#total_shipping').html(price);
                var total = formatCurrency(json.order_total + json.price, currencyFormat, currencySign, currencyBlank);
                $('#total_price').html(total);
            }
            else
            {
                $('#total_shipping').html(txtFree);
                var total = formatCurrency(json.order_total, currencyFormat, currencySign, currencyBlank);
                $('#total_price').html(total);
            }
            $('#total_tax').html(formatCurrency(json.total_tax, currencyFormat, currencySign, currencyBlank));
            $('tr.cart_total_delivery').show();
        }
    });
    ajaxQueries.push(query);
}

function resetAjaxQueries()
{
    for (i = 0; i < ajaxQueries.length; ++i)
        ajaxQueries[i].abort();
    ajaxQueries = new Array();
}
