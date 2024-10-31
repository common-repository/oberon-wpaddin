=== OBERON - WP Add-in ===
Contributors: mariomoravcik
Tags: oberon, booking, check-in, reception, reservation, 
Requires at least: 4.8
Tested up to: 5.8.1
Stable tag: 1.1.1
Requires PHP: 5.2+
License: GPLv2
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Plugin for communication with OBERON - Company agenda online web service API. Plugin contains multiple modules covering different aspects of web service.

== Description ==

The plugin is mostly usefull only to OBERON - Company agenda system customers. Plugin contains modules covering various aspects of OBERON Center web service API. The main purpose is to hide the public IP address and port of the company to make first line of defence against DDOS attacks or such.
Plugin is a collection of widgets and modules which use various parts of web service API to communicate with internal company systems. This plugin uses API part where there is no need to use credentials for logiing in to enable the web service access.
In addition, it also serves as a guide for developers in PHP and other languages to explain in practice using commented code how to connect to the OBERON web service API.

= Features added by this plugin =

* On-line guest pre check-in - module allowing guests to speed up the process of check in at the hotel by pre-filling of personal data in advance from home.


= Privacy =

The plugin do not collect or store any user related data, it serves only as a relay. We consider your company data as well as the data of your clients to be strictly private. 
Therefore, our plugin and applications do not share any data with third parties, including us.


== Installation ==

Best and suggested installation is directly from WordPress. If manual installation is required, please make sure that the plugin files are in a folder named "oberon-wpaddin" (not two nested folders) in the WordPress plugins folder, usually "wp-content/plugins".


== Frequently Asked Questions ==

= Do I need OBERON system to work with plugin? =

Yes, you also need to create system user in OBERON to allow acces to OBERON Web web services API.

= What do I need to begin with first? =

Most important part is to install system OBERON. Create or import new company base which will be the very back-end and where all the data meet and are processed. 
Depending on your needs you need to set the company with modules which will be used also by the API. 
Create system user with appropriate privileges for modules and tasks for the API. Setup OBERON Center application for hosting of new web service for the given company. 
Setup and run the web service  for desired tasks. Setup your local network and routers to route the communication to the computer with the web service running on a given port. 
Setup static WAN IP or dynamic DNS to which the wordpress plugin can connect. And as last setup the plugin that it connects to the given IP or dynamic adrress. 
The communication between the plugin and back-end service should be encrypted with your custom certificate and should be set in OBERON Center.

= Online check-in - purpose of module in plugin? =

The purpose is to enable hotel guest to fill in required personal data before arrival in hotel. This greatly speeds up the process of check-in at the reception desk.
The person on reception just have to check the data or fill more datails. This is mostly important for foreign guests. Advanced hotel reception setups dont even need
the presence of person upon arrival. The hotel key or keycard is handed to guest automatically via vending machine.


= Do you need help or have any questions? =

Contact with us via e-mail exalogic@exalogic.sk


== Screenshots ==


== Changelog ==

= 1.1.1 =
Version check

= 1.1 =
Small changes in texts and translation of Online check-in, cause clients (guests) using it wrote uncorrect informations (say in "Personal document" which changed to "Personal document number").

= 1.0 =
Initial version release of OBERON plugins. First module implemented Online check-in.
