import { Accessor, createBinding, For, onCleanup } from "ags";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import AstalNotifd from "gi://AstalNotifd";
import options from "../../../options";
import { NotificationBox } from "../../composables/NotificationsBox";

const notifd = AstalNotifd.get_default();

export default function ({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
   let thisWindow: Astal.Window;
   const notificationsBinding = createBinding(notifd, "notifications");

   function onKey(
      _e: Gtk.EventControllerKey,
      keyval: number,
      _: number,
      mod: number
   ) {
      if (keyval === Gdk.KEY_Escape) {
         thisWindow.visible = false;
         return;
      }
   }

   return (
      <window
         $={(self) => {
            thisWindow = self;
            onCleanup(() => self.destroy());
         }}
         gdkmonitor={gdkmonitor}
         name={options.controlCenter.name}
         namespace={options.controlCenter.name}
         layer={Astal.Layer.OVERLAY}
         cssClasses={["control-center-window"]}
         anchor={
            Astal.WindowAnchor.TOP |
            Astal.WindowAnchor.RIGHT |
            Astal.WindowAnchor.BOTTOM
         }
         exclusivity={Astal.Exclusivity.NORMAL}
         keymode={Astal.Keymode.NONE}
         application={app}
      >
         <Gtk.EventControllerKey onKeyPressed={onKey} />

         <box>
            <box cssClasses={["quick-settings-box"]} hexpand>
               <label label="placeholder" />
            </box>

            <box
               cssClasses={["notifications-box"]}
               hexpand
               orientation={Gtk.Orientation.VERTICAL}
            >
               <box>
                  <button
                     cssClasses={["notifications-clear-button"]}
                     hexpand
                     halign={Gtk.Align.CENTER}
                     onClicked={
                        () =>
                           notifd.notifications.forEach((notification) =>
                              notification.dismiss()
                           )

                        // this wrapper box stops it from the button itself expanding
                     }
                  >
                     <label label="Clear" />
                  </button>
               </box>

               <For each={notificationsBinding}>
                  {(notification) => (
                     <box orientation={Gtk.Orientation.VERTICAL}>
                        <NotificationBox
                           notification={notification}
                           nuke={() => {
                              notification.dismiss();
                           }}
                        />
                     </box>
                  )}
               </For>
            </box>
         </box>
      </window>
   );
}
