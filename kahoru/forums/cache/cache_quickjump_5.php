<?php

if (!defined('PUN')) exit;
define('PUN_QJ_LOADED', 1);
$forum_id = isset($forum_id) ? $forum_id : 0;

?>				<form id="qjump" method="get" action="viewforum.php">
					<div><label><span><?php echo $lang_common['Jump to'] ?><br /></span>
					<select name="id" onchange="window.location=('viewforum.php?id='+this.options[this.selectedIndex].value)">
						<optgroup label="General">
							<option value="2"<?php echo ($forum_id == 2) ? ' selected="selected"' : '' ?>>Announcements</option>
							<option value="3"<?php echo ($forum_id == 3) ? ' selected="selected"' : '' ?>>General talk</option>
							<option value="4"<?php echo ($forum_id == 4) ? ' selected="selected"' : '' ?>>Spotlight</option>
						</optgroup>
					</select></label>
					<input type="submit" value="<?php echo $lang_common['Go'] ?>" accesskey="g" />
					</div>
				</form>
