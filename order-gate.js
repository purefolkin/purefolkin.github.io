/*
  PUREFOLK GLOBAL ORDER GATE

  MASTER CONTROL:
  public.pf_settings.is_accepting_orders

  FALSE = ALL WEBSITE ORDERING CLOSED
  TRUE  = ORDERING OPEN

  This file does NOT delete or modify:
  - Products
  - Subscription plans
  - Delivery areas
  - Tally URLs
  - WhatsApp number

  It only controls access to ordering pathways.
*/

(function () {
  "use strict";

  const SUPABASE_URL =
    "https://sckfdujwszairutiwmwu.supabase.co";

  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_wXxKpQ1tNTAtniSPWvahjw_gloGsXZ6";

  const CLOSED_MESSAGE =
    "Ordering is temporarily closed. We are currently working on Purefolk and will reopen soon.";

  let ordersAreOpen = false;


  /*
    CHECK PUREFOLK ORDER STATUS
    Uses Supabase REST API directly.
  */
  async function checkOrderStatus() {
    try {

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/pf_settings?select=is_accepting_orders,announcement`,
        {
          method: "GET",
          headers: {
            "apikey": SUPABASE_PUBLISHABLE_KEY,
            "Authorization":
              `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
          },
          cache: "no-store"
        }
      );

      if (!response.ok) {
        throw new Error(
          `Supabase returned HTTP ${response.status}`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data) || !data.length) {
        throw new Error(
          "Purefolk settings were not found."
        );
      }

      ordersAreOpen =
        data[0].is_accepting_orders === true;

      console.log(
        "PUREFOLK ORDER STATUS:",
        ordersAreOpen ? "OPEN" : "CLOSED"
      );

      if (!ordersAreOpen) {
        lockOrdering();
      }

    } catch (error) {

      console.error(
        "PUREFOLK ORDER GATE ERROR:",
        error
      );

      /*
        SAFETY RULE:

        If the website cannot confirm that
        ordering is open, keep ordering CLOSED.
      */
      ordersAreOpen = false;

      lockOrdering();
    }
  }


  /*
    CUSTOMER MESSAGE
  */
  function showClosedMessage() {
    alert(CLOSED_MESSAGE);
  }


  /*
    CHECK WHETHER A CLICK IS AN ORDER ACTION
  */
  function isOrderAction(element) {

    if (!element) return false;

    const tag =
      element.tagName?.toLowerCase();

    const id =
      (element.id || "").toLowerCase();

    const className =
      (typeof element.className === "string"
        ? element.className
        : ""
      ).toLowerCase();

    const text =
      (element.textContent || "")
        .trim()
        .toLowerCase();

    const href =
      (element.getAttribute?.("href") || "")
        .toLowerCase();

    const onclick =
      (element.getAttribute?.("onclick") || "")
        .toLowerCase();


    /*
      DIRECT TALLY LINKS
    */
    if (href.includes("tally.so")) {
      return true;
    }


    /*
      DIRECT WHATSAPP LINKS
    */
    if (
      href.includes("wa.me") ||
      href.includes("whatsapp.com")
    ) {
      return true;
    }


    /*
      PUREFOLK ORDERING CLASSES
    */
    if (
      className.includes("wa-order-btn") ||
      className.includes("pf-btn-preorder")
    ) {
      return true;
    }


    /*
      PUREFOLK ORDERING IDS
    */
    if (
      id === "pf-whatsapp-hero"
    ) {
      return true;
    }


    /*
      SUBSCRIPTION INLINE FUNCTIONS
    */
    if (
      onclick.includes("startwhatsapp") ||
      onclick.includes("openform")
    ) {
      return true;
    }


    /*
      DELIVERY FORM SUBMIT
    */
    if (
      tag === "button" &&
      element.type === "submit" &&
      element.closest("#pf-delivery-form")
    ) {
      return true;
    }


    /*
      DELIVERY TALLY BUTTON
    */
    if (
      text.includes("open full pre-order form") ||
      text.includes("open full preorder form")
    ) {
      return true;
    }


    return false;
  }


  /*
    GLOBAL CLICK PROTECTION

    Capture phase runs before the existing
    Purefolk onclick functions.
  */
  document.addEventListener(
    "click",
    function (event) {

      if (ordersAreOpen) {
        return;
      }

      const element =
        event.target.closest(
          "a, button, input, [onclick]"
        );

      if (!element) {
        return;
      }

      if (!isOrderAction(element)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      showClosedMessage();

      return false;

    },
    true
  );


  /*
    GLOBAL FORM PROTECTION

    Prevent delivery/order forms from submitting.
  */
  document.addEventListener(
    "submit",
    function (event) {

      if (ordersAreOpen) {
        return;
      }

      const form = event.target;

      if (
        form &&
        form.id === "pf-delivery-form"
      ) {

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        showClosedMessage();

        return false;
      }

    },
    true
  );


  /*
    VISUAL LOCKING

    We do NOT change the website's text
    unnecessarily.

    We simply make order controls look inactive.
  */
  function lockElement(element) {

    if (!element) return;

    if (
      element.dataset.pfOrderLocked === "true"
    ) {
      return;
    }

    element.dataset.pfOrderLocked = "true";

    element.setAttribute(
      "aria-disabled",
      "true"
    );

    /*
      Only disable actual button elements.
    */
    if (
      element.tagName?.toLowerCase() === "button"
    ) {
      element.disabled = true;
    }

    element.style.opacity = "0.55";
    element.style.cursor = "not-allowed";
  }


  /*
    LOCK KNOWN ORDER CONTROLS
  */
  function lockOrdering() {

    /*
      Tally links
    */
    document
      .querySelectorAll(
        'a[href*="tally.so"]'
      )
      .forEach(lockElement);


    /*
      WhatsApp links
    */
    document
      .querySelectorAll(
        'a[href*="wa.me"], a[href*="whatsapp.com"]'
      )
      .forEach(lockElement);


    /*
      Purefolk order buttons
    */
    document
      .querySelectorAll(
        ".wa-order-btn, .pf-btn-preorder"
      )
      .forEach(lockElement);


    /*
      Menu WhatsApp button
    */
    const menuWhatsApp =
      document.getElementById(
        "pf-whatsapp-hero"
      );

    if (menuWhatsApp) {
      lockElement(menuWhatsApp);
    }


    /*
      Subscription buttons
    */
    document
      .querySelectorAll(
        'button[onclick*="startWhatsApp"], button[onclick*="openForm"]'
      )
      .forEach(lockElement);


    /*
      Delivery form submit
    */
    const deliveryForm =
      document.getElementById(
        "pf-delivery-form"
      );

    if (deliveryForm) {

      const submitButton =
        deliveryForm.querySelector(
          'button[type="submit"]'
        );

      if (submitButton) {
        lockElement(submitButton);
      }
    }


    console.log(
      "PUREFOLK: Ordering pathways are LOCKED."
    );
  }


  /*
    INITIALIZE AFTER DOM IS READY
  */
  function initOrderGate() {

    checkOrderStatus();

  }


  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initOrderGate
    );

  } else {

    initOrderGate();

  }

})();
