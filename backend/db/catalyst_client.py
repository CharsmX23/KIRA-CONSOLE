import zcatalyst_sdk


def get_catalyst_zcql():
    app = zcatalyst_sdk.initialize()
    return app.zcql()


def get_catalyst_datastore():
    app = zcatalyst_sdk.initialize()
    return app.datastore()
