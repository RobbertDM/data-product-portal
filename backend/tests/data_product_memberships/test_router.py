DATA_PRODUCTS_ENDPOINT = "/api/data_products"
MEMBERSHIPS_ENDPOINT = "/api/data_product_memberships"


class TestDataProductMembershipsRouter:
    def test_create_data_product_membership(
        self,
        client,
        session,
        default_data_product,
        default_user,
        default_secondary_user,
    ):
        created_data_product = self.create_default_data_product(
            client, default_data_product, default_user
        )
        assert created_data_product.status_code == 200
        assert "id" in created_data_product.json()
        data_product_id = created_data_product.json()["id"]

        data_product = self.get_data_product_by_id(client, data_product_id)
        assert data_product.status_code == 200

        session.add(default_secondary_user)
        secondary_user_membership = self.create_secondary_membership(
            client, default_secondary_user.id, data_product_id
        )
        assert secondary_user_membership.status_code == 200

    def test_request_data_product_membership(
        self,
        client,
        session,
        default_data_product,
        default_user,
        default_secondary_user,
    ):
        created_data_product = self.create_default_data_product(
            client, default_data_product, default_user
        )
        assert created_data_product.status_code == 200
        assert "id" in created_data_product.json()
        data_product_id = created_data_product.json()["id"]

        data_product = self.get_data_product_by_id(client, data_product_id)
        assert data_product.status_code == 200

        session.add(default_secondary_user)

        request_membership = self.request_data_product_membership(
            client, default_secondary_user.id, data_product_id
        )
        assert request_membership.status_code == 200

    def test_approve_data_product_membership_request(
        self,
        client,
        session,
        default_data_product,
        default_user,
        default_secondary_user,
    ):
        created_data_product = self.create_default_data_product(
            client, default_data_product, default_user
        )
        assert created_data_product.status_code == 200
        assert "id" in created_data_product.json()
        data_product_id = created_data_product.json()["id"]

        data_product = self.get_data_product_by_id(client, data_product_id)
        assert data_product.status_code == 200

        session.add(default_secondary_user)

        request_membership = self.request_data_product_membership(
            client, default_secondary_user.id, data_product_id
        )
        assert request_membership.status_code == 200

        membership_id = request_membership.json()["id"]
        approve_membership = self.approve_data_product_membership(client, membership_id)
        assert approve_membership.status_code == 200

    def test_deny_data_product_membership_request(self):
        pass

    def test_remove_data_product_membership(self):
        pass

    def test_update_data_product_membership_role(self):
        pass

    @staticmethod
    def default_data_product_payload(default_data_product, default_user):
        return {
            "name": default_data_product.name,
            "description": default_data_product.description,
            "external_id": str(default_data_product.external_id),
            "tags": default_data_product.tags,
            "type_id": str(default_data_product.type_id),
            "memberships": [
                {
                    "user_id": str(default_user.id),
                    "role": "owner",
                }
            ],
            "business_area_id": str(default_data_product.business_area_id),
        }

    def create_default_data_product(self, client, default_data_product, default_user):
        data = self.default_data_product_payload(default_data_product, default_user)
        response = client.post(DATA_PRODUCTS_ENDPOINT, json=data)
        return response

    @staticmethod
    def get_data_product_by_id(client, data_product_id):
        response = client.get(f"{DATA_PRODUCTS_ENDPOINT}/{data_product_id}")
        return response

    @staticmethod
    def create_secondary_membership(client, user_id, data_product_id):
        data = {
            "role": "member",
            "user_id": str(user_id),
        }
        response = client.post(
            f"{MEMBERSHIPS_ENDPOINT}/create?data_product_id={str(data_product_id)}",
            json=data,
        )
        return response

    @staticmethod
    def request_data_product_membership(client, user_id, data_product_id):
        response = client.post(
            f"{MEMBERSHIPS_ENDPOINT}/request?user_id={str(user_id)}"
            f"&data_product_id={str(data_product_id)}"
        )
        return response

    @staticmethod
    def approve_data_product_membership(client, membership_id):
        response = client.post(f"{MEMBERSHIPS_ENDPOINT}/{membership_id}/approve")
        return response