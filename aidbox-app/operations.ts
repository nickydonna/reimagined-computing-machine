import * as assert from "assert";
import { NotFoundError, ValidationError } from "@aidbox/node-server-sdk";
import { TOperation } from "./helpers";

export const editPatient: TOperation<{
  // Typing "resource" (POST payload)
  resource: {
    name: string;
    active: boolean;
  };
  // Optionally typing query/route params & form payload
  params: {
    foo: string;
  };
  "form-params": {
    foo: string;
  };
  "route-params": {
    foo: string;
  };
}> = {
  method: "POST",
  path: ["createPatient"],
  handlerFn: async (req, { ctx }) => {
    const {
      // "resource" contains POST payload
      resource,
      // "params", "form-params" & "route-params" are also accessible
      params,
      "form-params": formParams,
      "route-params": routeParams,
    } = req;
    assert.ok(resource, new ValidationError("resource required"));
    const { active, name } = resource;

    assert.ok(
      typeof active !== "undefined",
      new ValidationError('"active" required')
    );
    assert.ok(name, new ValidationError('"name" required'));

    const patient = await ctx.api.createResource<any>("Patient", {
      active: active,
      name: [{ text: name }],
    });
    return { resource: patient };
  },
};

export const test: TOperation<{ resource: { active: boolean } }> = {
  method: "GET",
  path: ["test"],
  handlerFn: async (req, { ctx, helpers }) => {
    // Test helpers
    console.log("Testing helpers");
    const { resources: patients, total: patientsTotal } =
      await helpers.findResources<any>("Patient", {
        _sort: "-createdAt",
        _count: 3,
      });
    console.log({ patientsTotal, patients });

    // Test log
    console.log("Testing log");
    await ctx.log({
      message: { error: "Testing log" },
      v: "2020.02",
      fx: "testOperation",
      type: "backend-test",
    });

    return { status: 200 };
  },
};

export const testError: TOperation<{ params: { type: string } }> = {
  method: "GET",
  path: ["testError"],
  handlerFn: async (req, { ctx }) => {
    switch (req.params.type) {
      case "ValidationError":
        throw new ValidationError("Testing ValidationError");
      case "NotFoundError":
        throw new NotFoundError("Something", {
          foo: "foo",
          bar: "bar",
        });
      case "AxiosError":
        await ctx.request({ url: "http://xxx" });
        return {};
      default:
        throw new Error("Testing default error");
    }
  },
};

export const testApi: TOperation<{ params: { type: string } }> = {
  method: "GET",
  path: ["testApi"],
  handlerFn: async (req, { ctx }) => {
    const { resources: patients } = await ctx.api.findResources<any>("Patient");

    const patient = !patients.length
      ? null
      : await ctx.api.getResource<any>("Patient", patients[0].id);

    console.log({ patients, patient });
    return { resource: { patients, patient } };
  },
};

export const testPsql: TOperation = {
  method: "GET",
  path: ["test-psql"],
  handlerFn: async (req, { ctx }) => {
    const result = await ctx.psql("select * from attribute limit 1");
    return { resource: result };
  },
};

export const testSql: TOperation = {
  method: "GET",
  path: ["test-sql"],
  handlerFn: async (req, { ctx }) => {
    const result = await ctx.sql(
      "select * from attribute where resource->>'module' = ? limit 1",
      ["fhir-4.0.0"]
    );
    console.log(result);
    return { resource: result };
  },
};

export const testBundle: TOperation = {
  method: "GET",
  path: ["test-bundle"],
  handlerFn: async (req, { ctx }) => {
    const result = await ctx.api.createBundle("batch", [
      {
        request: { method: "POST", url: "/Patient" },
        resource: { resourceType: "Patient" },
      },
    ]);
    console.log(result);
    return { resource: result };
  },
};

export const freshsalesWebhook: TOperation = {
  method: "POST",
  path: ["freshsalesWebhook"],
  handlerFn: async (req, { ctx }) => {
    const {
      // "resource" contains POST payload
      resource,
    } = req;

    const { lead_id, lead_first_name, lead_last_name, lead_email, lead_work_number, lead_mobile_number, lead_cf_accepts_marketing } = resource;

    const { resources, total } = await ctx.api.findResources("Patient", { ".leadId": lead_id, "_count": 1})

    const patient = {
      id: lead_id + '',
      leadId: lead_id + '',
      active: true,
      name: [{ given: [lead_first_name], family: lead_last_name }],
      telecom: [
        { system: 'email', value: lead_email },
        { system: 'phone', value: lead_work_number, use: 'work' },
        { system: 'phone', value: lead_mobile_number, use: 'mobile' },
      ],
      acceptsMarketing: lead_cf_accepts_marketing
    }

    if (total < 1) {
      await ctx.api.createResource("Patient", patient)
      console.log('create');
      return { resource: { ok: true } }
    }

    console.log('update');
    await ctx.api.patchResource("Patient", (resources as any[])[0].id, patient)

    return { resource: { ok: true } }
  }
}