<?php

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) || ! WP_UNINSTALL_PLUGIN ||
	dirname( WP_UNINSTALL_PLUGIN ) != dirname( plugin_basename( __FILE__ ) ) ) {

	exit;
}

delete_option( 'exalogic_oberonplugins_settings' );
delete_option( 'exalogic_oberonplugins_version' );

