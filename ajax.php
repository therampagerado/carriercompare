<?php
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

/* SSL Management */
$useSSL = true;

require_once(dirname(__FILE__).'../../../config/config.inc.php');
require_once(dirname(__FILE__).'../../../init.php');
require_once(dirname(__FILE__).'/carriercompare.php');

$carrierCompare = new CarrierCompare();

switch (Tools::getValue('method'))
{
	case 'getStates':
		if (!(int)Tools::getValue('id_country'))
			exit;
		die(Tools::jsonEncode($carrierCompare->getStatesByIdCountry((int)Tools::getValue('id_country'))));
		break;
	case 'getCarriers':
		die(Tools::jsonEncode($carrierCompare->getCarriersListByIdZone((int)Tools::getValue('id_country'), (int)Tools::getValue('id_state', 0), Tools::safeOutput(Tools::getValue('zipcode', 0)))));
		break;
	case 'simulateSelection':
		$cart_data = $carrierCompare->simulateSelection(Tools::getValue('carrier_id'), Tools::getValue('params'));
		die(Tools::jsonEncode($cart_data));
		break;
	default:
		exit;
}
exit;
