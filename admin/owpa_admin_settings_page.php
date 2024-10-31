<?php
/**
 * OBERON - WP Add-in
 * 
 * 
 * This file is part of the OBERON System and WordPress plugins made by Exalogic company and is released under the same license.
 * For more information please see owpa_plugin.php.
 * 
 * Copyright (c) 2007-2020 Mário Moravcik. All rights reserved.
 * 
 * Version: 1.1.1
 * Description:
 * Settings page for wordpress back-office administering of widgets and plugins inherited in this plugin.
 */

if ( ! defined( 'OWPA_ADMIN_PAGE' ) ) {
	exit;
}

if ( isset( $_POST['owpa-settings-save'] ) ) {
	check_admin_referer( 'owpa-settings-save-order' );
	$this->save_settings();
}

$usrid = get_current_user_id();
$lang = get_user_locale( $usrid );
$lang = substr( $lang, 0, 2 );
if ( !$lang ) {
	$lang = 'en';
}
?>

<div id="owpa-settings" class="wrapper">
	<div class="message-container"></div>
	<h2><?php _e( 'OBERON - WP Add-in', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ); ?></h2>
	<div class="description">
		<?php _e( 'This plugin is a collection of modules for communication with <b>OBERON - Company agenda</b> system via web service API. The plugin uses <b>OBERON Center</b> web service for online communication with company internal system to provide various interfaces like on-line pre check-in for company customers and users.', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ); ?>
	</div>

	<form id="oberon-settings-admin" action="" method="post">
		<?php wp_nonce_field( 'owpa-settings-save-order' ); ?>
		<div class="owpa-tab">
			<div class="owpa-tab-buttons">

				<p class="tab-submit-top">
					<input class="button button-primary button-large owpa-save" type="submit" name="owpa-settings-save" value="<?php _e( 'Save Changes', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ); ?>" />
				</p>
				<h3 class="tab-button active" data-id="owpa-common" tabindex="0">
					<span class="dashicons arrow-close dashicons-arrow-down"></span>
					<span class="dashicons arrow-open dashicons-arrow-right"></span>
					<?php _e( 'Common settings', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ); ?>
				</h3>
				
				<h3 class="tab-button" data-id="owpa-hotel" tabindex="1">
					<span class="dashicons arrow-close dashicons-arrow-down"></span>
					<span class="dashicons arrow-open dashicons-arrow-right"></span>
					<?php _e( 'Hotel', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ); ?>
				</h3>
			</div>
			<div class="owpa-tab-pages">
				<div class="tab-page" id="owpa-common">
					<h4>OBERON Center</h4>
					<div class="description">			
						<?php _e( 'OBERON Center is an integral part of OBERON system and is used for background tasks. These include running web services servers used for online communication.', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ); ?>
					</div>
					<h4>OBERON Web</h4>
					<div class="description">
					<?php _e( 'OBERON Web is an online web service module of OBERON Center for communication between system OBERON and its web components or third party services.', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ); ?>
					</div>

					<h4><?php _e( 'How to', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ); ?>:</h4>
					<ol>
						<li><?php _e( 'The most important thing is to ensure that the web service is availabe online for Internet access. This is done with public IP and port configured by the companies ISP (internet services provider).', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ); ?></li>
						<li><?php _e( 'The second major step is to configure internal network and firewalls to allow access from the Internet to the specific port used by OBERON Web service for communication. This should secured by the company internal network administrator.', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ); ?></li>
						<li><?php 
							_e( 'The next step (if not already done) is to install new </em>OBERON Web</em> service. Full documentation in slovak language is available in the ', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ); ?>
							<a href="https://exalogic.sk/help/oberon/index.html#Developers_WebServices_Installation.html" target="_blank"> <?php _e( 'on-line help', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ); ?> </a></li>
					</ol>
					
					<h3><?php _e( 'Basic settings', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ); ?>:</h3>		
					<?php echo $this->settings->create_control(
															$this->settings->controls->oberon_web_url,
															'OBERON Web - '.__( 'web service url', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ),
															$this->get_oberon_web_url(),
															'owpa-test-connection',
															__( 'Test connection', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ),					
															(!$this->get_oberon_web_url() ? true : false));  ?>				

				</div>
				
				<div class="tab-page hidden" id="owpa-hotel">
					<h3>Online guest pre check-in</h3>
					<div class="description">			
						<?php _e( 'The module is intended for guests to pre-fill their personal data (usualy from home) required for check-in upon arrival at accommodation facility. By filling their data in advance, they can make their check-in process more convenient and faster.', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ); ?>
					
						<h4><?php _e( 'Add to page', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ); ?>:</h4>
						<ol>
							<li><?php _e( 'Place the following shortcode inside wordpress page (preferred)', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ); echo ': [' . OWPA_CheckInWidget::CONST_SHORTCODE_GUESTCHECKIN . ']'; ?> </li>
							<li><?php _e( 'Add widget to the widget panel.', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ); ?></li>						
						</ol>
						<h4><?php _e( 'Redirect after successfull submit', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ); ?>:</h4>
						<?php _e( 'After successfull submision of personal data the user can be redirected to a given page.', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ); ?> </li>
						<?php echo $this->settings->create_control(
															$this->settings->controls->guest_checkin_success_url,
															__( 'Url for redirection', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ),
															$this->get_guest_checkin_success_url());  ?>
					</div>
				</div>
			</div>
		</div>
		<div class="button-list">						
			<input class="button button-primary button-large" type="submit" name="owpa-settings-save" value="<?php _e( 'Save Changes', OBERONWPAddin::CONST_PLUGIN_TEXT_DOMAIN ); ?>" />
		</div>
	</form>	
		
	<div class="owpa-settings-message"><!-- only  -->		
		<div class="message-header"></div>
		<div class="message-body">
			<div class="message-row">
				<div class="inner-icon"></div>
				<div class="inner-message">	
				</div>
			</div>
			<div class="button-row"></div>
		</div>
	</div>

</div>

<script type="text/javascript">

(function () {
	jQuery( document ).ready(function(){
				
		jQuery('#owpa-settings').eSettingsPage(
			{ root:		'<?php echo esc_url_raw( rest_url() ) ?>', 
			  nonce: 	'<?php echo wp_create_nonce( 'wp_rest' ) ?>',
			  apiBase: 	'<?php echo $this->get_base_api_path() ?>',
			  version: 	'<?php echo OWPA_RestController::CONST_REST_VERSION; ?>',
			});

	});
}).call(this);

</script>
